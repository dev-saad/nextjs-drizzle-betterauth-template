"use client";

import { checkOrgSlugAvailability } from "@/actions/server/organization.controllers";
import { Spinner } from "@/components/ui/spinner";
import { apiGet } from "@/lib/api/base";
import { asyncDebounce } from "@tanstack/react-pacer";
import { CircleCheck, CircleX, LucideIcon } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import { isValidPhoneNumber } from "react-phone-number-input";
import z from "zod";

interface ExistsResponse {
 exists: boolean | null;
 error?: string;
 color: "text-success" | "text-destructive" | "text-foreground/50";
 Icon: LucideIcon | React.ComponentType<any> | undefined;
 message?: string;
}

const INITIAL_STATE = {
 exists: null,
 color: "text-foreground/50" as const,
 Icon: undefined,
 message: undefined,
};

const LOADING_STATE = {
 exists: null,
 color: "text-foreground/50" as const,
 Icon: Spinner,
 message: "Checking availability...",
};

function useCheckAvailability<T>(
 validator: (value: T) => boolean,
 checkFn: (value: T) => Promise<boolean | null>,
 resourceLabel: string = "Value"
) {
 const [loading, setLoading] = useState(false);
 const [state, setState] =
  useState<Omit<ExistsResponse, "error">>(INITIAL_STATE);
 const lastRequestId = useRef<number>(0);

 const check = useCallback(
  asyncDebounce(
   async (value: T) => {
    const requestId = ++lastRequestId.current;
    const isValid = validator(value);

    if (!isValid) {
     if (requestId === lastRequestId.current) {
      setLoading(false);
      setState({
       exists: null,
       color: "text-foreground/50",
       Icon: undefined,
       message: undefined,
      });
     }
     return null;
    }

    setLoading(true);
    setState(LOADING_STATE);

    try {
     const exists = await checkFn(value);

     // Prevent race conditions: only update if this is the latest request
     if (requestId === lastRequestId.current) {
      if (exists === null) {
       // Error or invalid during check
       setState(INITIAL_STATE);
      } else if (exists) {
       // Exists (Taken) -> Error style
       setState({
        exists: true,
        color: "text-destructive",
        Icon: CircleX,
        message: `${resourceLabel} is already in use`,
       });
      } else {
       // Does not exist (Available) -> Success style
       setState({
        exists: false,
        color: "text-success",
        Icon: CircleCheck,
        message: `${resourceLabel} is available`,
       });
      }
      setLoading(false);
      return exists;
     }
    } catch {
     if (requestId === lastRequestId.current) {
      setState(INITIAL_STATE);
      setLoading(false);
     }
     return null;
    }
    return null;
   },
   { wait: 500 }
  ),
  [validator, checkFn, resourceLabel]
 );

 return {
  check,
  loading,
  ...state,
 };
}

export const useEmailExits = () => {
 const checkFn = useCallback(async (value: string) => {
  try {
   const res = await apiGet<ExistsResponse>("/api/auth/exists", {
    method: "GET",
    params: { email: value },
   });
   return res.exists;
  } catch {
   return null;
  }
 }, []);

 const validator = useCallback((value: string) => {
  return !!value && z.email().safeParse(value).success;
 }, []);

 const { check, loading, exists, color, Icon, message } = useCheckAvailability(
  validator,
  checkFn,
  "Email"
 );

 return {
  checkEmailExists: check,
  loading,
  exists,
  color,
  Icon,
  message,
 };
};

export const usePhoneExists = () => {
 const checkFn = useCallback(async (value: string) => {
  try {
   const res = await apiGet<ExistsResponse>("/api/auth/exists", {
    method: "GET",
    params: { phone: value },
   });
   return res.exists;
  } catch {
   return null;
  }
 }, []);

 const validator = useCallback((value: string) => {
  return !!value && isValidPhoneNumber(value);
 }, []);

 const { check, loading, exists, color, Icon, message } = useCheckAvailability(
  validator,
  checkFn,
  "Phone Number"
 );

 return {
  checkPhoneExists: check,
  loading,
  exists,
  color,
  Icon,
  message,
 };
};

export const useSlugExists = () => {
 const checkFn = useCallback(async (value: string) => {
  const { data, error } = await checkOrgSlugAvailability({
   slug: value,
  });
  if (error || data === undefined) return null;
  return !data; // true if taken, false if available
 }, []);

 const validator = useCallback((value: string) => {
  return !!value && z.string().min(1).safeParse(value).success;
 }, []);

 const { check, loading, exists, color, Icon, message } = useCheckAvailability(
  validator,
  checkFn,
  "Slug"
 );

 return {
  checkSlugExists: check,
  loading,
  exists,
  color,
  Icon,
  message,
 };
};

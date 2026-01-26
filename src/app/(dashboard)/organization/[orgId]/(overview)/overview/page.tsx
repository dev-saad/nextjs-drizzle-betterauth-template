const OverviewPage = async ({
 params,
}: {
 params: Promise<{ orgId: string }>;
}) => {
 const { orgId } = await params;
 return <h1>Overview {orgId}</h1>;
};

export default OverviewPage;

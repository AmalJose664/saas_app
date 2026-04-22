import EditPlan from "./EditPlan"

export default async function Page({
	params
}: {
	params: { id: string }
}) {
	const { id } = await params
	return (
		<div className="min-h-screen flex flex-col">
			<EditPlan id={id} />
		</div>
	)
}
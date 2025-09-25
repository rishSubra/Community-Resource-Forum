export function GET() {
  console.log(process.env.PORT);
  return Response.json({});
}
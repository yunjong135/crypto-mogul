export { runtime, dynamic } from "../../_utils"
import { passthrough } from "../../_utils"

export async function GET(req: Request) {
  return passthrough(req, "/api/health")
}

export async function OPTIONS(req: Request) {
  return passthrough(req, "/api/health")
}

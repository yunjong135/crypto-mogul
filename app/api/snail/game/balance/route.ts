export { runtime, dynamic } from "../../_utils"
import { passthrough } from "../../_utils"

export async function GET(req: Request) {
  return passthrough(req, "/api/balance")
}

export async function OPTIONS(req: Request) {
  return passthrough(req, "/api/balance")
}

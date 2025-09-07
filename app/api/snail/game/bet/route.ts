export { runtime, dynamic } from "../../_utils"
import { passthrough } from "../../_utils"

export async function POST(req: Request) {
  return passthrough(req, "/api/bet")
}

export async function OPTIONS(req: Request) {
  return passthrough(req, "/api/bet")
}

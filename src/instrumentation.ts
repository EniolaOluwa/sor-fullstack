/**
 * Runs once per server instance, before it starts handling requests.
 * Warms the Postgres pool so connection setup (which uses crypto.randomBytes
 * for the SCRAM nonce) never happens during a prerender pass.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { warmDb } = await import("./server/db/client");
    await warmDb();
  }
}

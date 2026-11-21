import { getLiveState } from "@/server/services/live";
import { toLiveStateData } from "@/features/projection/live-state";

/**
 * Polled every ~2s by the audience program page, display surface, and
 * admin previews. Always request-time: reads the event param and the
 * uncached live_state row.
 */
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/live/[eventId]">,
) {
  const { eventId } = await ctx.params;
  const state = await getLiveState(eventId);

  return Response.json(
    { state: toLiveStateData(state) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

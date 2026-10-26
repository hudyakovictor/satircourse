import type { ComponentType } from "react";
import type { MechProps } from "../kit";
import { Quiz, Speed, Pairs, Procedure, HigherLower } from "./memory";
import { Swipe, Baskets, PatternHunt, Zones, CandleBuilder, Jigsaw, Estimate, Predict } from "./chart";
import { RiskManager, PnlSprint, LimitLadder, LeverageLadder } from "./risk";
import { AnalystDesk, Lenses, Replay, OrderBook, Drill } from "./desk";
import { BossBattle, ShadowDemo, BossRush, PostMortem } from "./boss";
import { Catcher, Spin, Scratch, Runner, Snake, Aim, Loot } from "./arcade";

export const COMPONENTS: Record<string, ComponentType<MechProps>> = {
  m01: Quiz, m02: Speed, m03: Pairs, m04: Procedure, m17: HigherLower,
  m05: Swipe, m06: Baskets,
  m07: PatternHunt, m08: Zones, m09: CandleBuilder, m10: Jigsaw, m11: Estimate, m16: Predict,
  m12: RiskManager, m13: PnlSprint, m14: LimitLadder, m15: LeverageLadder,
  m18: AnalystDesk, lens: Lenses, m19: Replay, m20: OrderBook, m21: Drill,
  m22: BossBattle, shadow: ShadowDemo, m23: BossRush, m24: PostMortem,
  b01: Catcher, b02: Spin, b03: Scratch, b04: Runner, b05: Snake, b06: Aim, b07: Loot,
};

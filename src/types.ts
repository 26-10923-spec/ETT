/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ReceiptMetadata {
  store_name: string;
  transaction_date: string;
  approval_number: string;
}

export interface AnalyzedItem {
  name: string;
  category: 'Red' | 'Yellow' | 'Green';
  score_impact: number;
}

export interface ScoringInfo {
  final_score: number;
  points_earned_or_lost: number;
}

export interface GameVillageStatus {
  current_environment: 'Wasteland' | 'Developing' | 'Forest';
  weather: 'Sunny' | 'Cloudy' | 'Disaster';
  active_disaster: 'None' | 'Drought' | 'Flood';
  disaster_visual_effect_trigger: boolean;
  shop_available: boolean;
  status_message: string;
}

export interface ReceiptAnalysisResult {
  metadata: ReceiptMetadata;
  analyzed_items: AnalyzedItem[];
  scoring: ScoringInfo;
  game_village_status: GameVillageStatus;
  recommendations: string[];
  is_fallback?: boolean;
  fallback_reason?: string;
}

export interface DecorationItem {
  id: string;
  type: string; // dynamically supports all decoration items (e.g. tree, house, fence, mailbox, apartment, pond, etc.)
  x: number; // grid position percentage X (0-100)
  y: number; // grid position percentage Y (0-100)
  scale?: number;
}

export interface ShopItem {
  type: string;
  name: string;
  cost: number;
  icon: string;
  description: string;
}

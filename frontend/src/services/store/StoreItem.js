/**
 * StoreItem Domain Model
 * Represents a purchasable cosmetic, pass, or gold bundle in the Dragon Emporium.
 */
export class StoreItem {
  /**
   * @param {object} params
   */
  constructor({
    id,
    category,
    name,
    description,
    priceUsd = 0,
    priceEth = "0.00",
    goldAmount = 0,
    goldCost = 0,
    badge = "",
    icon = "🪙",
    color = "#f59e0b",
    effect = null,
  }) {
    this.id = id;
    this.category = category; // "gold" | "pass" | "brush"
    this.name = name;
    this.description = description;
    this.priceUsd = priceUsd;
    this.priceEth = priceEth;
    this.goldAmount = goldAmount;
    this.goldCost = goldCost;
    this.badge = badge;
    this.icon = icon;
    this.color = color;
    this.effect = effect;
  }

  isPurchasableWithGold() {
    return Boolean(this.goldCost && this.goldCost > 0);
  }

  isBrushCosmetic() {
    return this.category === "brush";
  }

  isGoldBundle() {
    return this.category === "gold";
  }
}

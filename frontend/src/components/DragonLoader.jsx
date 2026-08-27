import FireDragonLogo from "./FireDragonLogo.jsx";

export default function DragonLoader({ message = "Summoning the Dragon Realm…", size = "md" }) {
  return (
    <div className={`dragon-loader-wrap ${size}`}>
      <FireDragonLogo size={size === "lg" ? "lg" : "md"} showFireRing={true} />
      {message && <div className="dragon-loader-text">{message}</div>}
      <div className="dragon-loader-subtext">🔥 龍之王朝 · DRAGON DYNASTY 🔥</div>
    </div>
  );
}

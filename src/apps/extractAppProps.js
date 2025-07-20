export class LaunchParamParser {
  static extractAppProps() {
    console.log("🧪 extractAppProps() via LaunchParamParser");

    const params = new URLSearchParams(window.location.search);
    const base64 = params.get("feed") || params.get("props");

    console.log("🌍 Current window.location.href:", window.location.href);
    console.log("🔍 Current window.location.search:", window.location.search);
    console.log("📦 Base64 string to decode:", base64);

    if (!base64) {
      console.warn("⚠️ No feed or props param found.");
      return null;
    }

    try {
      const decoded = JSON.parse(decodeURIComponent(atob(base64)));
      console.log("📖 Decoded object:", decoded);

      // Normalize everything into one consistent structure
      const props = decoded?.props || decoded;
      const title = decoded.title || props.rom?.split('/').pop() || "err - rom";
      const type = decoded.type || "err - type";

      const user = props.user || "err - user";
      const save = props.save || "err - save";

      // Always normalize to window.feedItem so emulator patches can rely on it
      window.feedItem = {
        title,
        type,
        props: {
          ...props,
          title,
          type,
          user,
          save,
        },
      };

      console.log("📥 Final window.feedItem:", window.feedItem);

      // Return what the emulator runtime would need
      return window.feedItem.props;
    } catch (err) {
      console.error("❌ Failed to parse launch params:", err);
      return null;
    }
  }
}
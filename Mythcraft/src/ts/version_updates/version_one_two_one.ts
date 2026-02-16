const versionOneTwoOne = () => {
  getAttrs(["critical_range", "critical_range_base"], (v) => {
    setAttrs({
      critical_hit: v.critical_range || "20",
      critical_hit_base: v.critical_range_base || "20",
      critical_fail_base: "1",
      critical_fail: "1",
    });
  });
};

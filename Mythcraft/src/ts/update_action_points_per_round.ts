const updateActionPointsPerRound = (attributes: Attributes) => {
  getAttrs(attributes, (values) => {
    const { coordination, action_points_base } = parseIntegers(values);
    let action_points_per_round = action_points_base;

    switch (coordination) {
      case -1:
      case -2:
        action_points_per_round = action_points_base - 1 || 0;
        break;
      case -3:
        action_points_per_round = action_points_base - 2 || 0;
        break;
      default:
        // Action Points Per Round + half of the Coordination attribute
        action_points_per_round =
          Math.ceil(coordination / 2) + action_points_base;
        break;
    }

    setAttrs({ action_points_per_round });
  });
};

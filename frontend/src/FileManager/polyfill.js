if (!Object.groupBy) {
    Object.groupBy = function (items, callback) {
      return items.reduce((acc, item) => {
        const key = callback(item);
        (acc[key] ||= []).push(item);
        return acc;
      }, {});
    };
}
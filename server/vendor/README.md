lunar.cjs is the unchanged lunar.js from https://github.com/bullshitAI52/OldAlmanac at commit 0173ff76cddf7d2155ef823066734d0eca1fff25, reused for the owner's personal deployment.

Deployment: copy server.cjs, almanac.cjs and vendor/ (preserving its directory) to /opt/ziwei-api/, then restart ziwei-api. Existing credentials and iztro.min.js remain required.

Day mode supplies one day's full almanac; month mode supplies each day's almanac; year mode calculates all days and supplies counts and solar terms. Counts do not indicate probability or identify auspicious dates. Run node server/almanac-checks.cjs and node server/checks.cjs before deployment.

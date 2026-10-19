# 出海測試規劃工具 — Maritime Field Planner

Browser-local maritime test route planner.

部署與使用方式請見 [DEPLOY_GITHUB.md](DEPLOY_GITHUB.md)。

此套件包含航線編輯、光照分析、出發時間搜尋、北向固定立體天球與四方向相機快捷設定及 GitHub Pages 自動部署設定。

## Modules
- `dist/modules/geometry.js`: pure spherical geodesy, NOAA approximate solar position, camera-space rectangular FOV projection. Degrees, metres, epoch milliseconds; north-clockwise azimuth.
- `dist/modules/model.js`: versioned project schema validation, leg schedules, waypoint arrival constraints consumed by UI, distance/time sampling, arbitrary timeline evaluation. Taiwan time is explicitly UTC+08:00.
- `dist/modules/io.js`: project JSON, sample CSV and GeoJSON export adapters.
- `dist/modules/preferences.js`: departure-search defaults and defensive restoration of browser-saved criteria, including fallback when a selected leg no longer exists.
- `dist/app.js`: Leaflet adapter, DOM UI and browser-local persistence. No geometry hidden in map coordinates except visual screen-length sun ray.
- `dist/vendor`: pinned Leaflet 1.9.4 assets, no runtime CDN dependency for application code.

## Extension seams
Replace the solar function with SPA or a remote provider without altering routing. Extend schemaVersion with migrations before new vessel, attitude, camera arrays, or current models. Store heading independently from bearing for drift and vessel attitude. For multi-vessel scenarios, wrap the existing route model per vessel and evaluate each against a shared absolute timeline. Introduce a repository adapter to replace localStorage with authenticated storage. Keep tiles in a provider registry. Departure optimisation can reuse calculate/pointAt as a pure scoring kernel.

## Assumptions
Ground speed constant per leg, straight great-circle legs, no turning/acceleration. Stops use following-leg heading, terminal stop uses last-leg heading. Sample grid restarts per leg and includes endpoints; stop periods remain available via continuous timeline, not duplicated as cruise samples. Target arrival constraints report difference and required previous-leg speed without mutating speed or waiting automatically. Geometric solar elevation without refraction, no clouds/glint/shadows. NOAA fractional-year method is a planning approximation, not precision ephemeris. Camera zero roll. Earth sphere radius 6371008.8m. Not an ENC/navigation product.

## Verification
Run `npm test` for the geometry, route timing, search, sky, preferences and UI-event regression checks. The UI-event checks use a DOM/Leaflet test double; browser interaction and layout need a separate browser check.

## Map editing and layout
Drag blank map space to pan while drawing or editing. Waypoint drags automatically pan near the map edges. Toggle **平移地圖** to temporarily suspend waypoint editing and pan even when starting over a waypoint; toggle it again to resume. Holding Space while the map is hovered or focused temporarily activates the same mode. Text fields, buttons and open dialogs keep their normal keyboard behavior. The compact route overview and viewport-aware map height reserve room for the timeline on desktop screens; sample details remain scrollable below it.

## Departure search
`dist/modules/search.js` is an independent asynchronous search kernel. It reuses route timing and camera geometry, samples sailing-only intervals at 30-second midpoints, and evaluates a bounded grid of departure candidates. All constraints are ANDed. Results sort by longest contiguous qualifying window, then total qualifying duration. Stops break continuity. Windows can cross adjacent legs when there is no stop. UI displays the top 20 candidates and applies only departure time. Existing waypoint target times remain constraints and are recalculated on apply. All search criteria, including dates and selected leg, are saved separately under `maritime-search-v1` in localStorage when edited or when the dialog closes. They survive reopening and page reloads on the same origin, and are not part of exported project JSON. Missing legs fall back to the entire route; unavailable storage still allows in-session reuse.

## 3D sky view
`dist/modules/sky.js` uses east/north/up world coordinates and a fixed north-up orthographic view from the south at 22 degrees elevation. Ship geometry rotates only with route heading. The sun uses absolute solar azimuth and elevation, independently of camera yaw. Camera rays use heading plus relative yaw. Front/rear/left/right presets set the single active camera's yaw to 0/180/-90/90 degrees, preserving pitch and FOV, and update the same model used by the 2D compass, lighting analysis and departure search. Arbitrary yaw values remain supported and clear preset highlights. This is not a multi-camera configuration store. The map toolbar also opens an enlarged sky view.

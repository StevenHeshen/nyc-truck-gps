# NYC Truck GPS / Camión Seguro NYC / 纽约货车安全导航

An open-source, multilingual truck-safety project for New York City drivers, especially immigrants and drivers who may not read English fluently.

Languages: **English · 中文 · Español**

## Mission

Passenger-car navigation can direct commercial vehicles toward parkways, low-clearance structures, weight-restricted bridges, or tunnels with cargo restrictions. This project makes truck-specific warnings easier to understand in three languages and keeps the driver's vehicle dimensions at the center of every safety check.

The project is intended to support drivers, not replace professional judgment, posted signs, a commercial truck GPS, or official agency rules.

一个纽约货车专用导航 MVP 项目，包含：

- `mobile/`：Expo React Native 手机端
- `backend/`：Express + TypeScript API 后端
- `shared/`：共享类型、mock 数据、路线风险分析算法

当前版本可以直接用 mock 数据跑通：

1. 司机创建车辆档案：车高、重量、车长、车宽、轴数、Hazmat
2. 输入起点和终点
3. 后端返回三种路线：Truck-safe、Balanced、Fastest car route
4. 自动分析低桥、Parkway、桥梁限重、隧道/Hazmat、施工风险
5. 支持司机上报风险点
6. 支持 English / 中文 / Español 即时切换，并在本机保存语言偏好
7. API 不可用时进入明确标注的离线演示模式

> **Safety warning / 安全警告 / Advertencia de seguridad:** The current route and restriction records are demonstration data. Do not use this build for live driving. Always obey posted signs and current NYC DOT, NYSDOT, MTA, Port Authority, and other agency rules.

## Current engineering status

- Shared TypeScript vehicle-restriction engine used by both the API and mobile offline fallback
- Zod validation for vehicle profiles, route requests, and community reports
- Vehicle-specific checks for height, GVW, commercial-vehicle prohibitions, and Hazmat restrictions
- Persistent vehicle profile and language preference with AsyncStorage
- Tri-language UI for navigation, vehicle setup, safety warnings, statuses, and disclaimers
- Native Expo map displaying viewport-filtered NYC DOT Local and Through truck-route centerlines
- Community reporting prototype with pending/verified states

Still required before any live-navigation claim:

- Import and regularly refresh official truck-route geometry
- Replace mock restrictions with verified, source-attributed records
- Integrate geocoding, a map SDK, and a truck-capable routing engine
- Add route-corridor spatial matching with PostGIS
- Add authentication, report moderation, abuse controls, photo/GPS consent, and privacy retention rules
- Field-test with NYC commercial drivers and bilingual reviewers

## Official sources to integrate

- NYC DOT Trucks and Commercial Vehicles: https://www.nyc.gov/html/dot/html/motorist/trucks.shtml
- NYC DOT Truck Route Map and NYC Open Data truck-route layer (linked from the page above)
- NYC Traffic Rules, including truck routing, vehicle dimensions/weight, and parkway restrictions
- MTA Bridges and Tunnels commercial-vehicle restrictions
- Port Authority bridge and tunnel commercial-vehicle restrictions

Official maps themselves state that information can change and drivers must follow posted restrictions. Every imported record should therefore store `source_name`, `source_url`, and `updated_at`.

## 快速运行

### 1. 安装依赖

```bash
cd nyc-truck-gps
npm run install:all
```

### 2. 启动后端

```bash
npm run dev:backend
```

后端默认运行在：

```text
http://localhost:4000
```

健康检查：

```bash
curl http://localhost:4000/health
```

### 3. 启动手机端

另开一个终端：

```bash
npm run dev:mobile
```

然后用 Expo Go 扫码预览。

如果你在真机上访问本机后端，需要把 `mobile/src/config.ts` 里的：

```ts
export const API_BASE_URL = "http://localhost:4000";
```

改成电脑局域网 IP，例如：

```ts
export const API_BASE_URL = "http://192.168.1.20:4000";
```

## 后端 API

### 生成货车路线

```http
POST /api/routes/truck-safe
```

请求示例：

```json
{
  "origin": "Flushing, Queens",
  "destination": "Sunset Park, Brooklyn",
  "vehicle": {
    "id": "vehicle_1",
    "name": "My Box Truck",
    "type": "box_truck",
    "heightFt": 12,
    "heightIn": 6,
    "weightLbs": 26000,
    "lengthFt": 24,
    "widthFt": 8,
    "axles": 2,
    "hasHazmat": false
  }
}
```

### 获取限制点

```http
GET /api/restrictions
```

### 获取 NYC DOT 官方货车路线中心线

```http
GET /api/restrictions/truck-routes?borough=Bronx&limit=500
```

数据来自 NYC Open Data 数据集 `jjja-shxy`。接口返回 Local/Through 类型、街道、行政区、法规引用、`MultiLineString` 几何及来源元数据，并使用 15 分钟内存缓存。该图层是参考中心线，不是实时逐向导航路线。

### 创建司机上报

```http
POST /api/reports
```

## 下一步接真实数据

### 地图

推荐：

- Mapbox Navigation SDK
- MapLibre + 自建 tiles
- HERE / TomTom truck routing API

### 路由引擎

推荐：

- Valhalla：适合自定义路由代价和 truck profile
- GraphHopper：支持 truck profile，工程化友好
- OSRM：快，但 truck restriction 定制要更多工作

### 数据库

推荐：PostgreSQL + PostGIS。

可以导入：

- NYC DOT Truck Route Network
- NYC Open Data truck route shapefile/GeoJSON
- NYC low bridge/clearance data
- MTA Bridges & Tunnels commercial vehicle restrictions
- Port Authority bridge/tunnel restrictions
- OpenStreetMap road network

## 项目结构

```text
nyc-truck-gps/
  backend/
    src/
      index.ts
      routes/
      services/
  mobile/
    App.tsx
    src/
      screens/
      components/
      services/
  shared/
    src/
      types.ts
      mockData.ts
      routeAnalyzer.ts
```

## 法律免责声明建议

上线产品中必须显示类似声明：

> 本 App 提供的路线和限制信息仅供辅助参考。司机必须遵守现场交通标志、NYC DOT、MTA、Port Authority 以及其他官方机构的最新规定。本 App 不替代商业车辆驾驶员的专业判断。

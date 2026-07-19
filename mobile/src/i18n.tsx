import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "zh" | "es";
type Dictionary = Record<string, string>;

const dictionaries: Record<Language, Dictionary> = {
  en: {
    subtitle: "Safer routes for NYC truck drivers",
    route: "Route", vehicle: "Vehicle", reports: "Reports",
    generateRoute: "Plan a truck route", origin: "Origin", destination: "Destination", currentVehicle: "Current vehicle",
    height: "Height", weight: "GVW", generating: "Checking route...", generateTruckRoute: "Check truck-safe routes",
    localDataTitle: "Offline demo mode", localDataBody: "The server is unavailable. Results use local demonstration data and are not live navigation.",
    danger: "Danger", warning: "Caution", safe: "Safe", routeOptions: "Route options", riskChecks: "Safety checks",
    emptyRoute: "Enter a route to see vehicle-specific restrictions and safety checks.", currentRoute: "Current route", mockMap: "Map preview",
    vehicleProfile: "Vehicle profile", vehicleName: "Vehicle name", vehicleType: "Vehicle type", feet: "Height (feet)", inches: "Inches",
    gvw: "Gross vehicle weight", length: "Length", width: "Width", axles: "Axles", hazmat: "Hazardous materials",
    hazmatHelp: "Turn on to flag routes with hazardous-material restrictions.", saveVehicle: "Save vehicle", saved: "Saved",
    savedBody: "Vehicle profile saved on this device.", futureTitle: "Planned additions", futureBody: "DOT number, license plate, fleet accounts, multiple vehicles, cloud sync, and official data integrations.",
    driverReports: "Driver reports", issueType: "Issue type", location: "Location", details: "Details", submitReport: "Submit report",
    refreshReports: "Refresh reports", latestReports: "Recent community reports", submitted: "Submitted", submittedBody: "Your report is pending review.",
    useful: "drivers found this useful", pending_review: "Pending", verified: "Verified", recent: "Recent",
    box_truck: "Box truck", semi: "Semi", cargo_van: "Cargo van", dump_truck: "Dump truck", tractor_trailer: "Tractor-trailer",
    apiError: "Connection error", language: "Language", source: "Source", demo: "Demo data", official: "Official data", community: "Community data",
    officialSegments: "official segments", officialMapUnavailable: "Official truck-route layer is unavailable. The selected route remains demonstration data."
  },
  zh: {
    subtitle: "帮助纽约货车司机安全出行", route: "路线", vehicle: "车辆", reports: "上报",
    generateRoute: "规划货车路线", origin: "起点", destination: "终点", currentVehicle: "当前车辆", height: "车高", weight: "总重",
    generating: "正在检查路线…", generateTruckRoute: "检查货车安全路线", localDataTitle: "离线演示模式",
    localDataBody: "服务器暂时不可用。当前结果来自本地演示数据，不是真实导航。", danger: "危险", warning: "提醒", safe: "安全",
    routeOptions: "路线选择", riskChecks: "安全检查", emptyRoute: "输入路线后查看与你的车辆相关的限制和安全提醒。", currentRoute: "当前路线", mockMap: "地图预览",
    vehicleProfile: "车辆档案", vehicleName: "车辆名称", vehicleType: "车辆类型", feet: "车高（英尺）", inches: "英寸", gvw: "车辆总重",
    length: "车长", width: "车宽", axles: "轴数", hazmat: "危险品", hazmatHelp: "打开后会标记危险品限制路线。", saveVehicle: "保存车辆档案",
    saved: "已保存", savedBody: "车辆档案已保存到本机。", futureTitle: "计划增加", futureBody: "DOT 编号、车牌、车队账号、多车辆、云端同步和官方数据接入。",
    driverReports: "司机上报", issueType: "问题类型", location: "位置", details: "说明", submitReport: "提交上报", refreshReports: "刷新社区上报",
    latestReports: "社区最新上报", submitted: "已提交", submittedBody: "你的上报正在等待审核。", useful: "位司机认为有帮助",
    pending_review: "待审核", verified: "已核实", recent: "最新", box_truck: "厢式货车", semi: "半挂车", cargo_van: "货运面包车",
    dump_truck: "自卸卡车", tractor_trailer: "牵引挂车", apiError: "连接错误", language: "语言", source: "来源", demo: "演示数据", official: "官方数据", community: "社区数据",
    officialSegments: "条官方路段", officialMapUnavailable: "官方货车路线图层暂时不可用；所选路线仍为演示数据。"
  },
  es: {
    subtitle: "Rutas más seguras para camioneros de NYC", route: "Ruta", vehicle: "Vehículo", reports: "Reportes",
    generateRoute: "Planificar ruta de camión", origin: "Origen", destination: "Destino", currentVehicle: "Vehículo actual",
    height: "Altura", weight: "Peso bruto", generating: "Revisando ruta...", generateTruckRoute: "Revisar rutas seguras",
    localDataTitle: "Modo de demostración sin conexión", localDataBody: "El servidor no está disponible. Los resultados usan datos de demostración y no son navegación en vivo.",
    danger: "Peligro", warning: "Precaución", safe: "Seguro", routeOptions: "Opciones de ruta", riskChecks: "Revisiones de seguridad",
    emptyRoute: "Ingrese una ruta para ver restricciones específicas de su vehículo.", currentRoute: "Ruta actual", mockMap: "Vista previa del mapa",
    vehicleProfile: "Perfil del vehículo", vehicleName: "Nombre del vehículo", vehicleType: "Tipo de vehículo", feet: "Altura (pies)", inches: "Pulgadas",
    gvw: "Peso bruto vehicular", length: "Largo", width: "Ancho", axles: "Ejes", hazmat: "Materiales peligrosos",
    hazmatHelp: "Actívelo para señalar rutas con restricciones de materiales peligrosos.", saveVehicle: "Guardar vehículo", saved: "Guardado",
    savedBody: "El perfil del vehículo se guardó en este dispositivo.", futureTitle: "Próximas funciones", futureBody: "Número DOT, matrícula, cuentas de flota, varios vehículos, sincronización y datos oficiales.",
    driverReports: "Reportes de conductores", issueType: "Tipo de problema", location: "Ubicación", details: "Detalles", submitReport: "Enviar reporte",
    refreshReports: "Actualizar reportes", latestReports: "Reportes recientes", submitted: "Enviado", submittedBody: "Su reporte está pendiente de revisión.",
    useful: "conductores lo encontraron útil", pending_review: "Pendiente", verified: "Verificado", recent: "Reciente",
    box_truck: "Camión de caja", semi: "Semirremolque", cargo_van: "Furgoneta de carga", dump_truck: "Camión volquete", tractor_trailer: "Tractocamión",
    apiError: "Error de conexión", language: "Idioma", source: "Fuente", demo: "Datos de demostración", official: "Datos oficiales", community: "Datos comunitarios",
    officialSegments: "segmentos oficiales", officialMapUnavailable: "La capa oficial no está disponible. La ruta seleccionada sigue siendo de demostración."
  }
};

const dynamic: Record<Language, Record<string, string>> = {
  en: {},
  zh: {
    "Truck-safe route": "货车安全路线", "Balanced route": "平衡路线", "Fastest car route": "最快小客车路线",
    "Low Clearance Bridge": "低净空桥梁", "Parkway Restriction": "公园道路禁行", "Tunnel Restriction Check": "隧道限制检查",
    "Preferred Truck Route": "推荐货车路线", "Bridge Weight Review": "桥梁限重检查", "Reported Construction": "施工上报",
    "Uses truck-friendly corridors and avoids parkways and known low-clearance areas.": "使用允许货车通行的道路，避开公园道路和已知低净空路段。",
    "Shorter than the safest route, but includes one restriction that needs driver review.": "比最安全路线更短，但包含一项需要司机确认的限制。",
    "Faster, but may include parkway, tunnel, or low-clearance risks for trucks.": "速度较快，但可能包含公园道路、隧道或低净空风险。",
    "Routes and restrictions are for planning assistance only. Drivers must follow posted signs and official agency rules.": "路线与限制信息仅供辅助规划。司机必须遵守现场标志和政府机构的最新规定。"
  },
  es: {
    "Truck-safe route": "Ruta segura para camiones", "Balanced route": "Ruta equilibrada", "Fastest car route": "Ruta más rápida para autos",
    "Low Clearance Bridge": "Puente de baja altura", "Parkway Restriction": "Restricción de parkway", "Tunnel Restriction Check": "Revisión de restricciones del túnel",
    "Preferred Truck Route": "Ruta preferida para camiones", "Bridge Weight Review": "Revisión de peso del puente", "Reported Construction": "Construcción reportada",
    "Uses truck-friendly corridors and avoids parkways and known low-clearance areas.": "Usa corredores permitidos para camiones y evita parkways y zonas de baja altura conocidas.",
    "Shorter than the safest route, but includes one restriction that needs driver review.": "Más corta que la ruta más segura, pero incluye una restricción que el conductor debe revisar.",
    "Faster, but may include parkway, tunnel, or low-clearance risks for trucks.": "Más rápida, pero puede incluir riesgos de parkway, túnel o baja altura.",
    "Routes and restrictions are for planning assistance only. Drivers must follow posted signs and official agency rules.": "Las rutas y restricciones son solo una ayuda de planificación. Siga las señales y las reglas oficiales vigentes."
  }
};

interface LanguageContextValue { language: Language; setLanguage: (language: Language) => void; t: (key: string) => string; td: (text: string) => string; }
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  useEffect(() => { AsyncStorage.getItem("appLanguage").then((value) => { if (value === "en" || value === "zh" || value === "es") setLanguageState(value); }); }, []);
  const setLanguage = (next: Language) => { setLanguageState(next); AsyncStorage.setItem("appLanguage", next).catch(() => undefined); };
  const value = useMemo(() => ({ language, setLanguage, t: (key: string) => dictionaries[language][key] ?? dictionaries.en[key] ?? key, td: (text: string) => dynamic[language][text] ?? text }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}

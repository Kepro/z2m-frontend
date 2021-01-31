import { JSONSchema7 } from "json-schema";

export type DeviceType = "EndDevice" | "Router" | "Coordinator";


interface OTAState {
    state: "available" | "updating";
    progress: number;
    remaining: number;
}
export type RGBColor = {
    r: number;
    g: number;
    b: number;
}
export type HueSaturationColor = {
    hue: number;
    saturation: number;
}

export type XYColor = {
    x: number;
    y: number;
}
export type AnyColor = RGBColor | XYColor | HueSaturationColor;
export interface DeviceState {
    battery?: number;
    battery_low?: boolean;
    last_seen?: string | number;
    elapsed?: number;
    linkquality: number;
    update?: OTAState;
    state?: string;
    brightness?: number;
    color_temp?: number;
    color?: AnyColor;
    tilt?: number;
    position?: number;
    lastUpdate: number;
    click?: 'single' | 'double' | 'triple' | 'quadruple' | 'long' | 'long_release' | 'many';
    consumption?: number;
    power?: number;
    temperature?: number;
    away_mode?: 'ON' | 'OFF';
    humidity?: number;
    voltage?: number;
    contact?: boolean;
    occupancy?: boolean;
    water_leak?: boolean;
    local_temperature?: number;
    current_heating_setpoint?: number;
    // thermostat
    system_mode?: 'off' | 'heat' | 'auto';
    running_state?: 'idle' | 'heat';
    // [k: string]: string | number | boolean | OTAState | AnyColor | undefined;
}

export type Cluster = string;
export type Attribute = string;

export type Endpoint = string | number;




export interface Meta {
    revision: number;
    transportrev: number;
    product: number;
    majorrel: number;
    minorrel: number;
    maintrel: number;
}

export interface Coordinator {
    type: string;
    meta: Meta;
}

export interface Network {
    channel: number;
    pan_id: number;
    extended_pan_id: number[];
}

export interface DeviceConfig {
    [k: string]: object | string | number | boolean;
}
export interface Z2MConfig {
    homeassistant: boolean;
    advanced: {
        elapsed: boolean;
        last_seen: 'disable' | 'ISO_8601' | 'ISO_8601_local' | 'epoch';
        legacy_api: boolean;
    };
    devices: {
        [key: string]: DeviceConfig;
    };
    [k: string]: object | string | number | boolean;
}
export interface BridgeConfig {
    version: string;
    commit: string;
    coordinator: Coordinator;
    network: Network;
    log_level: string;
    permit_join: boolean;

}

export interface BridgeInfo {
    config?: Z2MConfig;
    config_schema: JSONSchema7;
    permit_join: boolean;
    commit?: string;
    version?: string;
    coordinator?: {
        meta?: {
            revision?: string;
        };
        type?: string;
    };
}

export type PowerSource = "Battery" | "Mains (single phase)" | "DC Source";

export type GenericFeatureType = "numeric" | "binary" | "enum" | "text";
export type ComposeiteFeatureType = "fan" | "light" | "switch" | "cover" | "lock" | "composite" | "climate";
export type AllPossibleFeatures = GenericFeatureType & ComposeiteFeatureType;


export enum FeatureAccessMode {
    NONE,
    ACCESS_STATE = 0b001,
    ACCESS_WRITE = 0b010,
    ACCESS_READ = 0b100,
}
export interface GenericExposedFeature {
    type: GenericFeatureType;
    name: string;
    unit?: "string";
    access: FeatureAccessMode;
    endpoint?: Endpoint;
    property: string;
    description?: string;
}

export interface BinaryFeature extends GenericExposedFeature {
    type: "binary";
    value_on: unknown;
    value_off: unknown;
    value_toggle?: unknown;
}

export interface CompositeFeature extends Omit<GenericExposedFeature, "type"> {
    type: ComposeiteFeatureType;
    features: (GenericExposedFeature | CompositeFeature)[];
}

export type GenericOrCompositeFeature = GenericExposedFeature | CompositeFeature;

export interface NumericFeaturePreset {
    name: string;
    value: number;
    description?: string;
}
export interface NumericFeature extends GenericExposedFeature {
    type: "numeric";
    value_min?: number;
    value_max?: number;
    presets?: NumericFeaturePreset[];
}

export interface TextualFeature extends GenericExposedFeature {
    type: "text";
}

export interface EnumFeature extends GenericExposedFeature {
    type: "enum";
    values: unknown[];
}

export interface LightFeature extends CompositeFeature {
    type: "light";
}

export interface SwitchFeature extends CompositeFeature {
    type: "switch";
}

export interface CoverFeature extends CompositeFeature {
    type: "cover";
}

export interface LockFeature extends CompositeFeature {
    type: "lock";
}
export interface FanFeature extends CompositeFeature {
    type: "fan";
}

export interface ClimateFeature extends CompositeFeature {
    type: "climate";
}

export interface ColorFeature extends CompositeFeature {
    type: "composite";
    name: "color_xy" | "color_hs";
    features: NumericFeature[];
}

export interface DeviceDefinition {
    description: string;
    model: string;
    supports: string;
    vendor: string;
    exposes: GenericExposedFeature[] | CompositeFeature[];
    supports_ota?: boolean;
}
export interface ReportingConfig {
    cluster: Cluster;
    attribute: Attribute;
    maximum_report_interval: number;
    minimum_report_interval: number;
    reportable_change: number;
}
export interface EndpointDescription {
    bindings: BindRule[];
    configured_reportings: ReportingConfig[];
    clusters: {
        input: Cluster[];
        output: Cluster[];
    };
}

export interface Device {
    ieee_address: string;
    type: DeviceType;
    network_address: number;
    model: string;
    friendly_name: string;
    power_source: PowerSource;
    model_id: string;
    interviewing: boolean;
    interview_completed: boolean;
    software_build_id: number;
    supported: boolean;
    definition?: DeviceDefinition;
    date_code: string;
    endpoints: Map<Endpoint, EndpointDescription>;
}

export type ObjectType = "device" | "group";
export interface BindRule {
    cluster: Cluster;
    target: {
        id?: number;
        endpoint?: Endpoint;
        ieee_address?: string;
        type: "endpoint" | "group";
    };

}
export type SortDirection = "asc" | "desc";

export interface TouchLinkDevice {
    ieee_address: string;
    channel: number;
}

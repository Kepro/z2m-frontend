import React, { useMemo } from 'react';
import { CompositeFeature } from 'types';
import { BaseFeatureProps } from 'components/features/base';
import DeviceFooter from 'components/Dashboard/DeviceFooter';

import styles from 'components/Dashboard/DashboardDevice.scss';
import DeviceImage from 'components/device-image';

type Props = BaseFeatureProps<CompositeFeature>;

type State = {
    isThermostat?: true;
    isSocket?: true;
    hasTemperature?: true;
    hasHumidity?: true;
    hasContact?: true;
    hasSwitch?: true;
    hasOccupancy?: true;
    hasWaterLeak?: true;
    hasClick?: true;
};

const DashboardDevice: React.FC<Props> = (props) => {
    const state = useMemo(() => {
        const state: Partial<State> = {};
        if (Array.isArray(props.feature.features)) {
            props.feature.features.forEach((config) => {
                if (config.type === 'climate') {
                    state.isThermostat = true;
                } else if (config.property === 'power' || config.property === 'energy') {
                    state.isSocket = true;
                }
                switch (config.property) {
                    case 'climate':
                        state.isThermostat = true;
                        break;
                    case 'temperature':
                        state.hasTemperature = true;
                        break;
                    case 'humidity':
                        state.hasHumidity = true;
                        break;
                    case 'contact':
                        state.hasContact = true;
                        break;
                    case 'switch':
                        state.hasSwitch = true;
                        break;
                    case 'occupancy':
                        state.hasOccupancy = true;
                        break;
                    case 'click':
                        state.hasClick = true;
                        break;
                    case 'water_leak':
                        state.hasWaterLeak = true;
                        break;
                }
            });
        }
        return state;
    }, [props.feature.features]);

    const renderContact = () => {
        const { contact } = props.deviceState;
        return (
            <div className={styles.entity}>
                <div className={styles.icon}>
                    <i className={`fa ${contact ? 'fa-door-closed text-muted' : 'fa-door-open text-primary'} fa-fw`} />
                </div>
                <div className={styles.title}>Contact</div>
                <div className={styles.value}>{contact ? 'Closed' : 'Opened'}</div>
            </div>
        );
    };

    const renderClick = () => {
        const { click } = props.deviceState;
        return (
            <div className={styles.entity}>
                <div className={styles.icon}>
                    <i className="fa fa-fw fa-circle" />
                </div>
                <div className={styles.title}>Button</div>
                <div className={styles.value}>{click}</div>
            </div>
        );
    };

    const renderOccupancy = () => {
        const { occupancy } = props.deviceState;
        return (
            <div className={styles.entity}>
                <div className={styles.icon}>
                    <i className={`fa fa-fw fa-walking ${occupancy ? 'text-warning' : ''}`} />
                </div>
                <div className={styles.title}>Occupancy</div>
                <div className={styles.value}>{occupancy ? 'Detected' : 'Clear'}</div>
            </div>
        );
    };

    const renderWaterLeak = () => {
        // eslint-disable-next-line @typescript-eslint/camelcase
        const { water_leak: waterLeak } = props.deviceState;
        return (
            <div className={styles.entity}>
                <div className={styles.icon}>
                    <i className={`fa fa-fw fa-water ${waterLeak ? 'text-primary' : ''}`} />
                </div>
                <div className={styles.title}>
                    Water Leak
                    {waterLeak ? <i className="fa fa-fw fa-exclamation-triangle text-danger" /> : null}
                </div>
                <div className={styles.value}>{waterLeak ? 'Detected' : 'Clear'}</div>
            </div>
        );
    };

    const renderHumidity = () => {
        const { humidity = 0 } = props.deviceState;
        return (
            <div className={styles.entity}>
                <div className={styles.icon}>
                    <i className="fa fa-fw text-info fa-tint" />
                </div>
                <div className={styles.title}>Humidity</div>
                <div className={styles.value}>{humidity} %</div>
            </div>
        );
    };

    const getTemperatureIcon = (temperature: number) => {
        let icon = 'fa-thermometer-empty';
        if (temperature >= 30) {
            icon = 'fa-thermometer-full';
        } else if (temperature >= 25) {
            icon = 'fa-thermometer-three-quarters';
        } else if (temperature >= 20) {
            icon = 'fa-thermometer-half';
        } else if (temperature >= 15) {
            icon = 'fa-thermometer-quarter';
        }
        return icon;
    };

    const renderTemperature = () => {
        const { temperature = 0 } = props.deviceState;
        const icon = getTemperatureIcon(temperature as number);
        return (
            <div className={styles.entity}>
                <div className={styles.icon}>
                    <i className={`fa fa-fw ${icon} text-danger`} />
                </div>
                <div className={styles.title}>Temperature</div>
                <div className={styles.value}>{temperature} °C</div>
            </div>
        );
    };

    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.onChange('', { state: event.target.checked ? 'ON' : 'OFF' });
    };

    const renderSwitch = () => {
        const { state, power } = props.deviceState;
        return (
            <div className={styles.entity}>
                <div className={styles.icon}>
                    <i className={`fa fa-fw fa-bolt ${state === 'ON' ? 'text-warning' : 'text-muted'}`} />
                </div>
                <div className={styles.title}>{state === 'ON' ? <>{power} W</> : <>Off</>}</div>
                <div className={styles.value}>
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            onChange={handleSwitchChange}
                            checked={state === 'ON'}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderThermostat = () => {
        const {
            local_temperature: localTemp = 0,
            current_heating_setpoint: currentHeatingSetPoint = 0,
            running_state: runningstate,
            system_mode: systemMode,
        } = props.deviceState;
        return (
            <>
                <div className={styles.entity}>
                    <div className={styles.icon}>
                        <i className="fa fa-fw fa-fire-alt text-warning" />
                    </div>
                    <div className={styles.title}>
                        Set ({systemMode}/{runningstate})
                    </div>
                    <div className={styles.value}>{currentHeatingSetPoint} °C</div>
                </div>
                <div className={styles.entity}>
                    <div className={styles.icon}>
                        <i className={`fa fa-fw ${getTemperatureIcon(localTemp)} text-danger`} />
                    </div>
                    <div className={styles.title}>Room</div>
                    <div className={styles.value}>{localTemp} °C</div>
                </div>
            </>
        );
    };

    return (
        <div className="col-xl-3 col-lg-4 col-sm-6 col-12 mb-3">
            <div className={`${styles.card} card`}>
                <div className="card-header text-truncate">{props.device.friendly_name}</div>
                <div className={`${styles.cardBody} card-body`}>
                    <DeviceImage device={props.device} className={styles.deviceImage} />
                    <div className={styles.exposes}>
                        {state.isThermostat ? renderThermostat() : null}
                        {!state.isSocket && state.hasTemperature ? renderTemperature() : null}
                        {state.hasHumidity ? renderHumidity() : null}
                        {state.hasContact ? renderContact() : null}
                        {state.isSocket ? renderSwitch() : null}
                        {state.hasOccupancy ? renderOccupancy() : null}
                        {state.hasClick ? renderClick() : null}
                        {state.hasWaterLeak ? renderWaterLeak() : null}
                    </div>
                </div>
                <DeviceFooter
                    lastUpdate={props.deviceState.last_seen}
                    battery={props.deviceState.battery}
                    voltage={props.deviceState.voltage}
                    source={props.device.power_source}
                    consumption={props.deviceState.consumption}
                    linkquality={props.deviceState.linkquality}
                    temperature={state.isSocket ? props.deviceState.temperature : undefined}
                />
            </div>
        </div>
    );
};

export default DashboardDevice;

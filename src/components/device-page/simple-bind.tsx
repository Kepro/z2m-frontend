import { Component, ComponentChild, h } from "preact";
import { Device, Dictionary } from "../../types";
import style from "./style.css";
import UniversalEditor from "../universal-editor";
import actions, { Actions } from "../../actions";
import { Notyf } from "notyf";
import { connect } from "unistore/preact";
import { GlobalState } from "../../store";

interface PropsFromStore {
    device: Device | undefined;
}

type DeviceParamTuple = [string, unknown];


export class SimpleBind extends Component<PropsFromStore & Actions, {}> {
    setStateValue = async (name: string, value: unknown) => {
        const { setStateValue, device, getDeviceInfo } = this.props;
        await setStateValue(device.nwkAddr, name, value);
        new Notyf().success(`Successfully updated state value ${name}=${value}`);
        getDeviceInfo(device.nwkAddr);

    };
    setSimpleBind = async (name: string, value: unknown) => {
        const { device, setSimpleBindValue, getDeviceInfo } = this.props;
        await setSimpleBindValue(device.nwkAddr, name, value);
        new Notyf().success(`Successfully updated simple bind value ${name}=${value}`);
        getDeviceInfo(device.nwkAddr);
    };

    render(): ComponentChild {
        const { device } = this.props;
        if (device) {
            return this.renderSimpleBinds();
        } else {
            return "Loading...";
        }

    }

    renderSimpleBinds(): ComponentChild {
        const { device } = this.props;
        const simpleBindRules: Dictionary<string> = device.SB ?? {};

        const kv = Object.entries(device.st ?? {});


        return <table class="table table-striped table-borderless">
            <thead>
            <tr>
                <th scope="col" />
                <th scope="col">Value</th>
                <th scope="col">SB rule</th>
            </tr>
            </thead>
            <tbody>
            {kv.map((param: DeviceParamTuple) => (
                <tr class={style["props-row"]}>
                    <th scope="row">{param[0]}</th>
                    <td class={style["value-col"]}>
                        <UniversalEditor
                            className="form-control-plaintext"
                            value={param[1]}
                            onChange={(value) => this.setStateValue(param[0], value)}
                        />
                    </td>
                    <td>
                        <UniversalEditor
                            className="form-control form-control-plaintext"
                            value={simpleBindRules[param[0]] || ""}
                            onChange={(value) => this.setSimpleBind(param[0], value)}
                        />
                    </td>
                </tr>
            ))}
            </tbody>
        </table>;

    }
}

const mappedProps = ["device"];

export default connect<{}, {}, GlobalState, PropsFromStore>(mappedProps, actions)(SimpleBind);
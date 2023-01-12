import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import {
    ClimateEntity,
    compareClimatePresets,
    computeRTL,
    HomeAssistant,
    Preset,
    isAvailable,
} from "../../../ha";
import "../../../shared/button";
import "../../../shared/button-group";
import { getPresetColor, getPresetIcon } from "../utils";

export const isPresetsVisible = (entity: ClimateEntity, presets?: Preset[]) =>
    (entity.attributes.presets || []).some((preset) => (presets ?? []).includes(preset));

@customElement("mushroom-climate-presets-control")
export class ClimatePresetsControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: ClimateEntity;

    @property({ attribute: false }) public presets!: Preset[];

    @property() public fill: boolean = false;

    private callService(e: CustomEvent) {
        e.stopPropagation();
        const preset = (e.target! as any).preset as Preset;
        this.hass.callService("climate", "set_preset_mode", {
            entity_id: this.entity!.entity_id,
            preset_mode: preset,
        });
    }

    protected render(): TemplateResult {
        const rtl = computeRTL(this.hass);

        const presets = this.entity.attributes.presets
            .filter((preset) => (this.presets ?? []).includes(preset))
            .sort(compareClimatePresets);

        return html`
            <mushroom-button-group .fill=${this.fill} ?rtl=${rtl}>
                ${presets.map((preset) => this.renderPresetButton(preset))}
            </mushroom-button-group>
        `;
    }

    private renderPresetButton(preset: Preset) {
        const iconStyle = {};
        const color = getPresetColor(preset);
        if (preset === this.entity.attributes.preset_mode) {
            iconStyle["--icon-color"] = `rgb(${color})`;
            iconStyle["--bg-color"] = `rgba(${color}, 0.2)`;
        }

        return html`
            <mushroom-button
                style=${styleMap(iconStyle)}
                .icon=${getPresetIcon(preset)}
                .preset=${preset}
                .disabled=${!isAvailable(this.entity)}
                @click=${this.callService}
            ></mushroom-button>
        `;
    }
}

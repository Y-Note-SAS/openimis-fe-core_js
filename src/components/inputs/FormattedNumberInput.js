import React, { Component } from "react";
import TextInput from "./TextInput";
import { injectIntl } from "react-intl";
import { formatMessage, formatMessageWithValues } from "../../helpers/i18n";
import withModulesManager from "../../helpers/modules";

class FormattedNumberInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdited: false,
      rawValue: props.value != null ? this.formatNumber(props.value) : "",
    };
  }

  componentDidUpdate(prevProps) {
    const { value } = this.props;
    const { isEdited, rawValue } = this.state;
    const valueChanged = !Object.is(prevProps.value, value);
    const hasValue = value !== null && value !== undefined;

    // On ne reformate que si la valeur serveur a changé et que l'utilisateur n'édite pas,
    // et seulement si le formatage produit un texte différent (évite les boucles setState).
    if (valueChanged && !isEdited) {
      const formattedValue = hasValue ? this.formatNumber(value) : "";
      if (formattedValue !== rawValue) {
        this.setState({ rawValue: formattedValue });
      }
    }
  }

  normalizeNumberInput = (raw) => {
    if (!raw) return "";
    let normalized = raw.replace(/\s/g, "");
    const hasComma = normalized.includes(",");
    const hasDot = normalized.includes(".");

    if (hasComma && hasDot) {
      normalized = normalized.replace(/,/g, "");
    } else if (hasComma && !hasDot) {
      const parts = normalized.split(",");
      if (parts[1]?.length === 3) {
        normalized = normalized.replace(/,/g, "");
      } else {
        normalized = normalized.replace(",", ".");
      }
    }
    return normalized;
  };

  parseRawValue = (raw) => parseFloat(this.normalizeNumberInput(raw));

  formatNumber = (value) => {
    if (value == null || isNaN(value)) return "";
    let decimals = this.props.numberOfDecimals;
    if (this.props.allowDecimals === false) {
      decimals = 0;
    }
    return new Intl.NumberFormat(this.props.thousandSeparator, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  handleKeyPress = (event) => {
    if (event.key === ".") {
      if (this.props.allowDecimals === false || this.props.numberOfDecimals === 0) {
        event.preventDefault();
      }
    }
  };

  handleChange = (val) => {
    this.setState({ rawValue: val });

    const value = this.parseRawValue(val);
    // On ne notifie le parent que si la valeur parsée diffère de celle déjà en props,
    // et on passe undefined (et non null) pour une valeur vide -> évite les boucles de rendu.
    if (!Object.is(value, this.props.value)) {
      this.props.onChange(Number.isNaN(value) ? undefined : value);
    }
  };

  handleBlur = () => {
    const { intl, displayNa } = this.props;
    const { rawValue } = this.state;

    this.setState({ isEdited: false });

    const normalized = this.normalizeNumberInput(rawValue);
    const number = Number.parseFloat(normalized);

    if ((rawValue === "" || Number.isNaN(number)) && displayNa) {
      this.setState({
        rawValue: formatMessage(intl, this.props.module, "core.NumberInput.notApplicable"),
      });
      return;
    }

    if (Number.isNaN(number)) {
      this.setState({ rawValue: "" });
      return;
    }

    this.setState({ rawValue: this.formatNumber(number) });
  };

  handleFocus = () => {
    this.setState({ isEdited: true });
  };

  render() {
    const {
      intl,
      module = "core",
      min = null,
      max = null,
      error,
      thousandSeparator,
      numberOfDecimals,
      allowDecimals = true,
      displayZero = false,
      displayNa = false,
      decimal,
      onChange,
      ...others
    } = this.props;

    let inputProps = {
      ...this.props.inputProps,
      type: "text",
      onKeyPress: this.handleKeyPress,
    };

    let err = error;

    const numericValue = this.parseRawValue(this.state.rawValue);
    if (min != null && !Number.isNaN(numericValue) && numericValue < min) {
      err = formatMessageWithValues(intl, module, "validation.minValue", { value: numericValue, min });
    }
    if (max != null && !Number.isNaN(numericValue) && numericValue > max) {
      err = formatMessageWithValues(intl, module, "validation.maxValue", { value: numericValue, max });
    }

    return (
      <TextInput
        {...others}
        module={module}
        value={this.state.rawValue}
        error={err}
        inputProps={inputProps}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
        onFocus={this.handleFocus}
      />
    );
  }
}

export default withModulesManager(injectIntl(FormattedNumberInput));

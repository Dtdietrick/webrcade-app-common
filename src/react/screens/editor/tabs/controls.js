import React from "react";

import { EditorTab } from '../'

import {
  XboxOneAButton,
  XboxOneBButton,
  XboxOneXButton,
  XboxOneYButton,
  XboxOneDpad,
  XboxOneDpadLeft,
  XboxOneDpadRight,
  XboxOneDpadUp,
  XboxOneDpadDown,
  XboxOneLeftStick,
  XboxOneLeftStickUp,
  XboxOneLeftStickDown,
  XboxOneLeftStickLeft,
  XboxOneLeftStickRight,
  XboxOneRightStick,
  XboxOneRightStickUp,
  XboxOneRightStickDown,
  XboxOneRightStickLeft,
  XboxOneRightStickRight,
  XboxOneLeftStickClick,
  XboxOneRightStickClick,
  XboxOneMenuButton,
  XboxOneWindowsButton,
  XboxOneLeftBumper,
  XboxOneRightBumper,
  XboxOneRightTrigger,
  XboxOneLeftTrigger,
  ArrowUpKey,
  ArrowDownKey,
  ArrowLeftKey,
  ArrowRightKey,
  ControlKey,
  EscapeKey,
  EnterKey,
  ShiftKey,
  AKey,
  CKey,
  DKey,
  SKey,
  VKey,
  XKey,
  ZKey,
  QKey,
  WKey,
  IKey,
  JKey,
  KKey,
  LKey,
  TKey,
  RKey,
  EKey,
  PeriodKey,
  SpaceKey,
  ZeroKey,
  OneKey,
  TwoKey,
  ThreeKey,
  FourKey,
  FiveKey,
  SixKey,
  SevenKey,
  EightKey,
  NineKey,
  MinusKey,
  EqualsKey,
  F5Key,
  F7Key
} from '../../../../images'

import styles from './controls-style.scss'

export class ControlsTab extends EditorTab {

  getGamepadImage(control) {
    switch (control) {
      case "start":
        return XboxOneMenuButton;
      case "select":
        return XboxOneWindowsButton;
      case "dpad":
        return XboxOneDpad;
      case "dpadl":
        return XboxOneDpadLeft;
      case "dpadr":
        return XboxOneDpadRight;
      case "dpadu":
        return XboxOneDpadUp;
      case "dpadd":
        return XboxOneDpadDown;
      case "lanalog":
        return XboxOneLeftStick;
      case "lanalogu":
        return XboxOneLeftStickUp;
      case "lanalogd":
        return XboxOneLeftStickDown;
      case "lanalogl":
        return XboxOneLeftStickLeft;
      case "lanalogr":
        return XboxOneLeftStickRight;
      case "ranalog":
        return XboxOneRightStick;
      case "ranalogu":
        return XboxOneRightStickUp;
      case "ranalogd":
        return XboxOneRightStickDown;
      case "ranalogl":
        return XboxOneRightStickLeft;
      case "ranalogr":
        return XboxOneRightStickRight;
      case "lanalogc":
        return XboxOneLeftStickClick;
      case "ranalogc":
        return XboxOneRightStickClick;
      case "a":
        return XboxOneAButton;
      case "b":
        return XboxOneBButton;
      case "x":
        return XboxOneXButton;
      case "y":
        return XboxOneYButton;
      case "lbump":
        return XboxOneLeftBumper;
      case "rbump":
        return XboxOneRightBumper;
      case "ltrig":
        return XboxOneLeftTrigger;
      case "rtrig":
        return XboxOneRightTrigger;
    }
  }

  getKeyImage(key) {
    switch (key) {
      case 'Escape':
        return EscapeKey;
      case 'Enter':
        return EnterKey;
      case 'ControlLeft':
        return ControlKey;
      case 'ShiftRight':
        return ShiftKey;
      case 'ShiftLeft':
        return ShiftKey;
      case 'Space':
        return SpaceKey;
      case 'ArrowRight':
        return ArrowRightKey;
      case 'ArrowLeft':
        return ArrowLeftKey;
      case 'ArrowUp':
        return ArrowUpKey;
      case 'ArrowDown':
        return ArrowDownKey;
      case 'KeyZ':
        return ZKey;
      case 'KeyX':
        return XKey;
      case 'KeyC':
        return CKey;
      case 'KeyV':
        return VKey;
      case 'KeyA':
        return AKey;
      case 'KeyS':
        return SKey;
      case 'KeyD':
        return DKey;
      case 'KeyQ':
        return QKey;
      case 'KeyW':
        return WKey;
      case 'KeyI':
        return IKey;
      case 'KeyJ':
        return JKey;
      case 'KeyK':
        return KKey;
      case 'KeyL':
        return LKey;
      case 'KeyT':
        return TKey;
      case 'KeyR':
        return RKey;
      case 'KeyE':
        return EKey;
      case 'KeyPeriod':
        return PeriodKey;
      case 'Digit0':
        return ZeroKey;
      case 'Digit1':
        return OneKey;
      case 'Digit2':
        return TwoKey;
      case 'Digit3':
        return ThreeKey;
      case 'Digit4':
        return FourKey;
      case 'Digit5':
        return FiveKey;
      case 'Digit6':
        return SixKey;
      case 'Digit7':
        return SevenKey;
      case 'Digit8':
        return EightKey;
      case 'Digit9':
        return NineKey;
      case 'Minus':
        return MinusKey;
      case 'Equal':
        return EqualsKey;
      case 'KeyF5':
        return F5Key;
      case 'KeyF7':
        return F7Key;
      default:
        return "";
    }
  }

  formatDescription(description) {
    return description.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  }

  renderKey(key, description) {
    return (
      <div key={key} className={styles['controls-screen-row']}>
        <div className={styles['controls-screen-column']}>
          <img className={styles['controls-key']} src={this.getKeyImage(key)} alt=""></img>
        </div>
        <div className={styles['controls-screen-column']}>
          {description}
        </div>
      </div>
    );
  }

  renderKeys(keyList, description) {
    const keys = [];
    for (let i = 0; i < keyList.length; i++) {
      const key = keyList[i];
      if (i > 0) {
        keys.push(<div style={{whiteSpace: 'nowrap'}}>&nbsp;+&nbsp;</div>);
      }
      keys.push(
        <img className={styles['controls-gamepad-button']} src={this.getKeyImage(key)} alt=""></img>
      )
    }

    return (
      <div /*key={key}*/ className={styles['controls-screen-row']}>
        <div className={styles['controls-screen-column']}>
          <div style={{display: 'flex', alignItems: 'center'}} >
            {keys}
          </div>
        </div>
        <div className={styles['controls-screen-column']}>
        {this.formatDescription(description)}
        </div>
      </div>
    );
  }

  renderControl(control, description) {
    return (
      <div className={styles['controls-screen-row']}>
        <div className={styles['controls-screen-column']}>
          <img className={styles['controls-gamepad-button']} src={this.getGamepadImage(control)} alt=""></img>
        </div>
        <div className={styles['controls-screen-column']}>
          {this.formatDescription(description)}
        </div>
      </div>
    );
  }

  renderControls(control, control2, description) {
    return (
      <div className={styles['controls-screen-row']}>
        <div className={styles['controls-screen-column']}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <img className={styles['controls-gamepad-button']} src={this.getGamepadImage(control)} alt=""></img>
            <span style={{ margin: '0 0.5rem' }}>+</span>
            <img className={styles['controls-gamepad-button']} src={this.getGamepadImage(control2)} alt=""></img>
          </div>
        </div>
        <div className={styles['controls-screen-column']}>
          {this.formatDescription(description)}
        </div>
      </div>
    );
  }


  renderControlWithText(control, text, description) {
    return (
      <div className={styles['controls-screen-row']}>
        <div className={styles['controls-screen-column']}>
          <img className={styles['controls-gamepad-button']} src={this.getGamepadImage(control)} alt=""></img>{text}
        </div>
        <div className={styles['controls-screen-column']}>
          {this.formatDescription(description)}
        </div>
      </div>
    );
  }
}

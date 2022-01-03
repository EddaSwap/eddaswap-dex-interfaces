import React from "react";
import { ReactSVG } from "react-svg";
import store from "stores";

export const icons = {
  "icon-twitter": "/icons/twitter.svg", //
  "icon-instagram": "/icons/instagram.svg", //
  "icon-telegram": "/icons/telegram.svg", //
  "icon-medium": "/icons/medium.svg", //
  "icon-medium-dark": "/icons/medium-white.svg", //
  "icon-question": "/icons/question.svg", //
  "icon-down-arrow": "/icons/down-arrow.svg", //
  "icon-sound": "/icons/sound.svg", //
  "icon-swap": "/icons/swap.svg", //
};

export function getIcon(name, className) {
  const state = store.getState();
  let theme = "default";

  if (state) {
    theme = state.app.storage.theme;
  }

  if (icons[name]) {
    return (
      <ReactSVG
        key={`icon-${name}`}
        className={`icon ${name} ${className}`}
        src={
          theme === "dark" && icons[`${name}-dark`]
            ? icons[`${name}-dark`]
            : icons[name]
        }
      />
    );
  }
  return null;
}

const images = {
  "edda-logo-dark": "/images/logo-white.svg",
  "edda-logo": "/images/logo-color.svg",
};

export function getImagePath(name) {
  const state = store.getState();
  let theme = "default";

  if (state) {
    theme = state.app.storage.theme;
  }

  return theme === "dark" ? images[`${name}-dark`] : images[`${name}`];
}

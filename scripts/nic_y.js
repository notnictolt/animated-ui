const buttonTypes = [
  "play_button",
  "settings_button",
  "skin_button",
  "inbox_button",
  "friends_button",
  "marketplace_button",
  "profile_button",
  "event_button",
  "exit_button",
];

const buttonPresets = {
  play_button: {
    pressed: "$play_button_target",
    text: "%menu.play",
    hover: "§l%menu.play",
  },
  settings_button: {
    pressed: "button.menu_settings",
    text: "%menu.settings",
    hover: "§l%menu.settings",
  },
  skin_button: {
    pressed: "button.menu_skins",
    text: "%menu.skins",
    hover: "§l%menu.skins",
  },
  inbox_button: {
    pressed: "button.menu_inbox",
    text: "('§z%menu.inbox' + #unread_status)",
    hover: "('§l%menu.inbox' + #unread_status)",
  },
  friends_button: {
    pressed: "button.friends_drawer",
    text: "('§z' + #friends_with_count)",
    hover: "('§l' + #friends_with_count)",
  },
  marketplace_button: {
    pressed: "button.menu_store",
    text: "%menu.store",
    hover: "§l%menu.store",
  },
  profile_button: {
    pressed: "button.menu_profile",
    text: "('%menu.profile (' + #playername + ')')",
    hover: "('§l%menu.profile (' + #playername + ')')",
  },
  event_button: {
    pressed: "button.gathering",
    text: "%gathering.button.join.liveEventFallback",
    hover: "§l%gathering.button.join.liveEventFallback",
  },
  exit_button: {
    pressed: "button.menu_exit",
    text: "%gui.exit",
    hover: "§l%gui.exit",
  },
};

function parsePair(input) {
  return input.split(",").map((v) => {
    v = v.trim();

    if (v.includes("%")) return v;

    const num = Number(v);
    return isNaN(num) ? v : num;
  });
}

function togglePanelUI() {
  const type = document.getElementById("panel_type").value;
  const img = document.getElementById("image_style");

  if (img) {
    img.style.display = type === "image" ? "block" : "none";
  }
}

function applyPreset(typeEl, defEl, hovEl) {
  const type = typeEl.value;
  const p = buttonPresets[type];

  // check toggles
  const useName = document.getElementById("profile_use_name")?.value !== "no";
  const useCount = document.getElementById("friends_use_count")?.value !== "no";

  // profile toggle OFF → don't override user input
  if (type === "profile_button" && !useName) return;

  // friends toggle OFF → don't override user input
  if (type === "friends_button" && !useCount) return;

  defEl.value = p.text;
  hovEl.value = p.hover;
}

function generateButtons() {
  const container = document.getElementById("buttons_container");
  container.innerHTML = "";

  const count = Number(document.getElementById("btn_count").value);

  for (let i = 0; i < count; i++) {
    const wrap = document.createElement("div");

    const type = document.createElement("select");
    buttonTypes.forEach((t) => {
      const o = document.createElement("option");
      o.value = t;
      o.textContent = t;
      type.appendChild(o);
    });

    const def = document.createElement("input");
    def.placeholder = "Default text";

    const hov = document.createElement("input");
    hov.placeholder = "Hover text";

    wrap.appendChild(type);
    wrap.appendChild(def);
    wrap.appendChild(hov);
    container.appendChild(wrap);

    applyPreset(type, def, hov);

    type.addEventListener("change", () => {
      applyPreset(type, def, hov);
      updateJSON();
    });

    def.addEventListener("input", updateJSON);
    hov.addEventListener("input", updateJSON);
  }

  updateJSON();
}

function buildBindings(type, text, hover) {
  // ✅ Inbox custom values
  if (type === "inbox_button") {
    const inboxTrue = document.getElementById("inbox_true")?.value || " §c!";
    const inboxFalse = document.getElementById("inbox_false")?.value || "";

    return {
      $button_text: "#text",
      $button_text_hover: "#text_hover",
      $button_text_property_bag: {
        "#inbox_unread_true": inboxTrue,
        "#inbox_unread_false": inboxFalse,
      },
      $button_text_bindings: [
        {
          binding_type: "global",
          binding_name: "#unread_notification_icon_visibility",
        },
        {
          binding_type: "view",
          source_property_name:
            "('#inbox_unread_' + #unread_notification_icon_visibility)",
          target_property_name: "#unread_status",
        },
        {
          binding_type: "view",
          source_property_name: `${text}`,
          target_property_name: "#text",
        },
        {
          binding_type: "view",
          source_property_name: `${hover}`,
          target_property_name: "#text_hover",
        },
      ],
    };
  }

  // ✅ Friends toggle
  if (type === "friends_button") {
    const useCount =
      document.getElementById("friends_use_count")?.value !== "no";

    if (!useCount) return null;

    return {
      $button_text: "#text",
      $button_text_hover: "#text_hover",
      $button_text_bindings: [
        {
          binding_type: "global",
          binding_name: "#friends_with_count",
        },
        {
          binding_type: "view",
          source_property_name: `${text}`,
          target_property_name: "#text",
        },
        {
          binding_type: "view",
          source_property_name: `${hover}`,
          target_property_name: "#text_hover",
        },
      ],
    };
  }

  // ✅ Profile toggle
  if (type === "profile_button") {
    const useName = document.getElementById("profile_use_name")?.value !== "no";

    if (!useName) return null;

    return {
      $button_text: "#text",
      $button_text_hover: "#text_hover",
      $button_text_bindings: [
        { binding_name: "#playername" },
        {
          binding_type: "view",
          source_property_name: `${text}`,
          target_property_name: "#text",
        },
        {
          binding_type: "view",
          source_property_name: `${hover}`,
          target_property_name: "#text_hover",
        },
      ],
    };
  }

  if (type === "event_button") {
    return {
      $button_text: "%gathering.button.join.liveEventFallback",
      $button_text_hover: "§l%gathering.button.join.liveEventFallback",
      bindings: [
        {
          binding_name: "#gathering_enabled",
          binding_name_override: "#visible",
        },
      ],
    };
  }

  return null;
}

function updateJSON() {
  togglePanelUI();

  const panelType = document.getElementById("panel_type").value;
  const panelSize = parsePair(
    document.getElementById("panel_size").value || "100%,20"
  );

  const defFont = document.getElementById("font_default").value;
  const hovFont = document.getElementById("font_hover").value;

  const defColor = parsePair(
    document.getElementById("color_default").value || "1,1,1"
  );
  const hovColor = parsePair(
    document.getElementById("color_hover").value || "1,1,1"
  );

  const scale = Number(document.getElementById("font_scale").value || 1);
  const align = document.getElementById("align").value;

  const size = parsePair(document.getElementById("size").value || "120,128");
  const animFrom = parsePair(
    document.getElementById("anim_from").value || "0,20%"
  );
  const animTo = parsePair(document.getElementById("anim_to").value || "0,0");
  const anchor = document.getElementById("anchor").value;

  const anchorMap = {
    left: "left_middle",
    right: "right_middle",
    center: "center",
  };
  const anchorVal = anchorMap[align] || "center";

  const data = {
    namespace: "nic_y",
    content: {
      type: "panel",
      size: size,
      animation_reset_name: "screen_animation_reset",
      anims: ["@nic_start.in_anim", "@nic_start.out_anim"],
      anchor_from: anchor,
      anchor_to: anchor,
      $anim_from: animFrom,
      $anim_to: animTo,
      controls: [{ "stacked_panel@stacked_panel": {} }],
    },

    stacked_panel: {
      type: "stack_panel",
      size: ["100%", "100%"],
      orientation: "vertical",
      controls: [],
    },
  };

  document.querySelectorAll("#buttons_container > div").forEach((div) => {
    const type = div.children[0].value;

    // clone preset (important to avoid mutation bug)
    const preset = { ...buttonPresets[type] };

    // profile toggle
    if (type === "profile_button") {
      const useName =
        document.getElementById("profile_use_name")?.value !== "no";

      if (!useName) {
        preset.text = "%menu.profile";
        preset.hover = "§l%menu.profile";
      }
    }

    // friends toggle
    if (type === "friends_button") {
      const useCount =
        document.getElementById("friends_use_count")?.value !== "no";

      if (!useCount) {
        preset.text = "%selectWorld.tab.friends";
        preset.hover = "§l%selectWorld.tab.friends";
      }
    }
    const defInput = div.children[1].value;
    const hovInput = div.children[2].value;

    const def = defInput || preset.text;
    const hov = hovInput || preset.hover;

    data.stacked_panel.controls.push({
      [`${type}@${type}`]: {},
    });

    let obj = {
      $pressed_button_name: preset.pressed,
    };

    const special = buildBindings(type, def, hov);

    if (special) {
      Object.assign(obj, special);
    } else {
      obj["$button_text"] = def;
      obj["$button_text_hover"] = hov;
    }

    data[`${type}@button_panel`] = obj;
  });

  if (panelType === "label") {
    data["button_panel@common.button"] = {
      size: panelSize,
      controls: [
        {
          "default@button_content": {
            text: "$button_text",
            font_type: defFont,
            color: defColor,
          },
        },
        {
          "hover@button_content": {
            text: "$button_text_hover",
            font_type: hovFont,
            color: hovColor,
          },
        },
        {
          "pressed@button_content": {
            text: "$button_text_hover",
            font_type: hovFont,
            color: hovColor,
          },
        },
      ],
    };
    data["button_content"] = {
      type: "label",
      font_scale_factor: scale,
      anchor_from: anchorVal,
      anchor_to: anchorVal,
      "$button_text_property_bag|default": {},
      property_bag: "$button_text_property_bag",
      "button_text_bindings|default": [],
      bindings: "$button_text_bindings",
    };
  } else {
    const defTex =
      document.getElementById("tex_default").value ||
      "textures/animated_ui/button";

    const hovTex = document.getElementById("tex_hover").value || defTex;

    const imgSize = parsePair(
      document.getElementById("img_size").value || "100% - 2px,100% - 2px"
    );

    data["button_panel@common.button"] = {
      size: panelSize,
      controls: [
        {
          "default@button_content": {
            texture: defTex,
            $button_label: "$button_text",
            $button_label_font_type: defFont,
            $button_label_color: defColor,
          },
        },
        {
          "hover@button_content": {
            texture: hovTex,
            $button_label: "$button_text_hover",
            $button_label_font_type: hovFont,
            $button_label_color: hovColor,
          },
        },
        {
          "pressed@button_content": {
            texture: hovTex,
            $button_label: "$button_text_hover",
            $button_label_font_type: hovFont,
            $button_label_color: hovColor,
          },
        },
      ],
    };

    data["button_content"] = {
      type: "image",
      size: imgSize,
      controls: [
        {
          button_label: {
            type: "label",
            text: "$button_label",
            font_type: "$button_label_font_type",
            font_scale_factor: scale,
            text_alignment: align,
            color: "$button_label_color",
            "$button_text_property_bag|default": {},
            property_bag: "$button_text_property_bag",
          },
        },
      ],
    };
  }

  document.getElementById("output").textContent = JSON.stringify(data, null, 4);
}

function downloadJSON() {
  const blob = new Blob([document.getElementById("output").textContent], {
    type: "application/json",
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "nic_y.json";
  a.click();
}

document.getElementById("panel_type").addEventListener("change", updateJSON);

document.getElementById("btn_count").addEventListener("input", generateButtons);

document.querySelectorAll("input, select").forEach((el) => {
  el.addEventListener("input", updateJSON);
});

generateButtons();

# DynamicDialogV2
> Protocol 1.21.100+  
> Support Qssentials v1.1 or above (EssPlugin)  

---

## ScriptEventId
```

dialog\:text

```

### Command
```

/scriptevent dialog\:text text1|text2|text3|background|avatar|sound

```

- **text1** → First line of dialog (supports dynamic text format)  
- **text2** → Second line of dialog (optional)  
- **text3** → Third line of dialog (optional)  
- **background** → Background texture path (default: `textures/ui/greyBorder`)  
- **avatar** → Avatar texture path (default: `textures/dialogue/default`)  
- **sound** → Default sound effect (default: `dialogue.txt1`)  

---

## Example Usage

### In-Game
```

/scriptevent dialog\:text Hello there!|Welcome to my world.|Enjoy your stay.|textures/dialogue/background|textures/dialogue/default|random.pop

````

This shows 3 lines of animated dialog with a background, avatar, and sound effect.

---

## Example (Code Reference)

```js
import { system } from "@minecraft/server";

system.afterEvents.scriptEventReceive.subscribe(async (e) => {
  if (e.id === "dialog:text") {
    const player = e.sourceEntity;
    const [
      text1 = "Hi+(,;20)°(my name;1)+( §e;1)°(Nperma;1)",
      text2 = "+(This is DynamicDialogV2;20)",
      text3 = "+(Powered by EssPlugin;30)",
      background = "textures/dialogue/background",
      avatar = "textures/dialogue/default",
      sound = "dialogue.txt1"
    ] = e.message.split("|");

    displayDialog(player, text1, text2, text3, background, avatar, sound);
  }
});
````

---

## Dynamic Text Syntax

DynamicDialogV2 supports **special tokens** for controlling how text appears:

* `&(text;sound)` → Instant text with optional sound
* `+(text;duration;sound)` → Timed text (appears after given ticks)
* `°(text;delay;sound)` → Delayed per-character typing
* `.` or normal chars → Appear letter by letter with default sound

Example:

```
/scriptevent dialog:text °(Hello;2;dialogue.txt2)+( ;10)&(World!)
```

This will type `"Hello"` slowly, pause, then instantly add `"World!"`.

---

## Feature Overview

| Feature                | Supported | Notes                                    |
| ---------------------- | --------- | ---------------------------------------- |
| Multi-line Dialog (3x) | ✔         | Supports up to 3 lines per dialog event  |
| Instant Text `&( )`    | ✔         | Appears immediately, with optional sound |
| Timed Text `+( )`      | ✔         | Displays after a set duration (ticks)    |
| Delayed Typing `°( )`  | ✔         | Prints character-by-character with delay |
| Background Texture     | ✔         | Custom texture path supported            |
| Avatar Texture         | ✔         | Custom avatar path supported             |
| Sound Effects          | ✔         | Per-char, per-token, or default sound    |

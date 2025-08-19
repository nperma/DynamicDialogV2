import { system } from "@minecraft/server";

//register for support Qssentials
system.runTimeout(
  () =>
    system.sendScriptEvent(
      "register:plugin",
      JSON.stringify({
        namespace: "DynamicDialogV2",
        description: "Dialogue Text",
        protocol: "110|2.0.0"
      })
    ),
  3
);

function parseText(input, defaultVoiceEffect = "dialogue.txt1") {
  const regex = /&\((.*?)(?:;(.*?))?\)|\+\((.*?);(\d+)(?:;(.*?))?\)|°\((.*?);(\d+)(?:;(.*?))?\)|./g;

  const text = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
    if (match[1]) {
      //&
      text.push({ type: "instant", value: match[1], soundId: match[2] || defaultVoiceEffect });
    } else if (match[3] && match[4]) {
      //+
      text.push({
        type: "timed",
        value: match[3],
        duration: parseInt(match[4]),
        soundId: match[5] || defaultVoiceEffect
      });
    } else if (match[6] && match[7]) {
      //°
      text.push({
        type: "delayed",
        value: match[6],
        delay: parseInt(match[7]),
        soundId: match[8] || defaultVoiceEffect
      });
    } else {
      text.push({ type: "char", value: match[0], soundId: defaultVoiceEffect });
    }
  }

  return text;
}

function adjustLength(text = "", totalLength = 400) {
  return text.slice(0, totalLength).padEnd(totalLength, "\t");
}

async function runSingleText(sender, parsed, lineIndex, lines, defaultVoiceEffect, background, avatar) {
  let tts = "";
  let index = 0;
  let charIndex = 0;
  let tickStart = system.currentTick;

  return new Promise((resolve) => {
    const interval = system.runInterval(() => {
      const currentTick = system.currentTick;
      const elapsedTicks = currentTick - tickStart;

      if (index < parsed.length) {
        const current = parsed[index];

        if (current.type === "char") {
          tts += current.value;
          lines[lineIndex] = tts;
          sender.onScreenDisplay.setActionBar(
            "dialog:" +
              adjustLength(background, 200) + // border dummy
              adjustLength(avatar, 200) +
              adjustLength(lines[0]) +
              adjustLength(lines[1]) +
              adjustLength(lines[2])
          );
          sender.playSound(current.soundId);
          index++;
        } else if (current.type === "instant") {
          tts += current.value;
          lines[lineIndex] = tts;
          sender.onScreenDisplay.setActionBar("dialog:" + adjustLength(background, 200) + adjustLength(avatar, 200) + adjustLength(lines[0]) + adjustLength(lines[1]) + adjustLength(lines[2]));
          sender.playSound(current.soundId);
          index++;
        } else if (current.type === "timed") {
          if (elapsedTicks >= current.duration) {
            tts += current.value;
            lines[lineIndex] = tts;
            sender.onScreenDisplay.setActionBar("dialog:" + adjustLength(background, 200) + adjustLength(avatar, 200) + adjustLength(lines[0]) + adjustLength(lines[1]) + adjustLength(lines[2]));
            sender.playSound(current.soundId);
            index++;
            tickStart = currentTick;
          }
        } else if (current.type === "delayed") {
          if (elapsedTicks >= current.delay) {
            tts += current.value[charIndex];
            lines[lineIndex] = tts;
            sender.onScreenDisplay.setActionBar("dialog:" + adjustLength(background, 200) + adjustLength(avatar, 200) + adjustLength(lines[0]) + adjustLength(lines[1]) + adjustLength(lines[2]));
            sender.playSound(current.soundId);
            charIndex++;
            tickStart = currentTick;

            if (charIndex >= current.value.length) {
              charIndex = 0;
              index++;
            }
          }
        }
      } else {
        system.clearRun(interval);
        resolve(tts);
      }
    });
  });
}

async function displayDialog(sender, text1 = "", text2 = "", text3 = "", background = "textures/ui/greyBorder", avatar = "", defaultVoiceEffect = "dialogue.txt1") {
  let lines = ["", "", ""];

  if (text1) {
    const parsed = parseText(text1, defaultVoiceEffect);
    lines[0] = await runSingleText(sender, parsed, 0, lines, defaultVoiceEffect, background, avatar);
  }
  if (text2) {
    const parsed = parseText(text2, defaultVoiceEffect);
    lines[1] = await runSingleText(sender, parsed, 1, lines, defaultVoiceEffect, background, avatar);
  }
  if (text3) {
    const parsed = parseText(text3, defaultVoiceEffect);
    lines[2] = await runSingleText(sender, parsed, 2, lines, defaultVoiceEffect, background, avatar);
  }
}

system.afterEvents.scriptEventReceive.subscribe(async (e) => {
  if (e.id === "dialog:text") {
    //use dialog:text
    const player = e.sourceEntity;
    const [
      text1 = "Hi+(,;20)+( ;10)°(my name;1)+(§e ;1)°(Nperma;1)",
      text2 = "+(Y;20)°(ea is testing DynamicDialogV2;1)",
      text3 = "+(I;10)°( think i will publish soon;1)+(, ;14)°(after i made trailer for my essentials;1)°( :>;3)+(.;5)+( §a#MCdevID;40;random.levelup)",
      background = "textures/dialogue/background",
      avatar = "textures/dialogue/default",
      sound = "dialogue.txt1"
    ] = e.message.split("|");
    displayDialog(player, text1 || "Hi+(,;10)+( ;20)°(my name;1)+(§e ;1)°(Nperma;1)", text2, text3, background, avatar, sound);
  } else if (e.id === "dialog:message1") {
    //example
    const player = e.sourceEntity;
    const dlogg = (arg, avatar = "textures/dialogue/default") => displayDialog(player, arg?.[0] ?? "", arg?.[1] ?? "", arg?.[2] ?? "", "textures/dialogue/background", avatar, "");

    await dlogg(["°(Hi.;1;dialogue.txt2)+( ;30)"]);
    await dlogg(["&(Hi)°(, long time no see;1;dialogue.txt2)°(..;5;dialogue.txt2)+(.;10;dialogue.txt2)+( ;25)"], "textures/dialogue/bohong");
    await dlogg(["&(Hi, long time no see...)", "°(Anyway.;1;dialogue.txt2)+( ;20)&(§a)°(I Have News;1;dialogue.txt2)°(!!;3;dialogue.txt2)&( )+( ;10)"]);
    await dlogg(["+(wait;1)°(...;30)", "+(.;20)  +(.;20)  +(.;20)  +(.;20)  +(.;20)  +(.;20)+(.;20)+(.;20)", "+((No Answer.);20)+( ;40)"], "");
    await dlogg(["+(.;2) +(.;2) +(.;2)+( ;30)", "+(§cWhat!!§r;4;note.pling)+( ;20)°(Where;2;dialogue.txt1) °(tHe;4;dialogue.txt1) &(§4§l)°(Ne;3;dialogue.txt1)°(ws?;5;dialogue.txt1)+( ;30)"], "");
    await dlogg(["+(.;15;dialogue.txt2)   +(.;15;dialogue.txt2)   +(.;15;dialogue.txt2)+( ;20)"], "textures/dialogue/swag");
    await dlogg(["&(.   .   .)", "°(Coming Soon;2;dialogue.txt2)"], "textures/dialogue/challange");
    await system.waitTicks(70);
    player.runCommand('ctitle "Qssentials V1.1" "Addon Timpa + Bayar = Murahan"');
    player.playSound("random.anvil_break");
  }
});

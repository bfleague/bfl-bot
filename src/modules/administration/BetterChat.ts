import { Color } from "../../Global";
import Module from "../../core/Module";
import Room from "../../core/Room";
import { Team } from "../../core/Global";
import Player from "../../core/Player";

import * as Global from "../../Global";
import Command, { CommandInfo } from "../../core/Command";

export class BetterChat extends Module {
    private asianRegex = RegExp(/[\p{Script_Extensions=Mymr}\p{Script_Extensions=Han}\p{Script_Extensions=Hira}\p{Script_Extensions=Kana}\p{Script_Extensions=Bopo}\p{Script=Khmer}\p{Script=Lao}\p{Script_Extensions=Phag}\p{Script=Tai_Tham}\p{Script=Thai}\p{Script=Tibetan}]/ug);
    private emojiRegex = RegExp(/[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/ug);
    private longRegex = RegExp(/(βΈ»|π|π«|ο·½|π|π|π‘|π|π|π°|πͺ|π©|π|π«)/gi);
    
    constructor(room: Room) {
        super();

        room.on("playerChat", (player, message) => {
            if (!player.isConfirmed()) return false;

            if (this.isUsingIllegalChars(message)) {
                player.reply({ message: `β οΈ Mensagem bloqueada! Excesso de caracteres especiais`, sound: 2, color: Global.Color.Orange, style: "bold" });

                return false;
            }

            if (message.startsWith(";") && player.getTeam() !== Team.Spectators) {
                this.sendTeamMessage(room, player, message);

                return;
            }

            let color = Color.White;
            let prefix = "β¬";

            if (!player.roles.includes(Global.loggedRole) && !player.roles.includes(Global.bypassRegisterRole)) {
                prefix = "βοΈ";
            } else if (player.getTeam() === Team.Red) {
                prefix = "π₯";
            } else if (player.getTeam() === Team.Blue) {
                prefix = "π¦";
            } else if (player.isAdmin()) {
                prefix = "π¨";
            } else if (player.roles.includes(Global.loggedRole)) {
                prefix = "β";
            }
    
            const mentionedPlayers = room.getPlayers().filter(p => message.includes(p.getMention())).map(p => p.id);
    
            if (mentionedPlayers.length > 0) {
                for (const p of room.getPlayers()) {
                    const isMentioned = mentionedPlayers.includes(p.id);
    
                    p.reply({
                        message: `${prefix} ${player.name}: ${message}`,
                        color: isMentioned ? Color.White : color,
                        style: isMentioned ? "bold" : "normal",
                        sound: isMentioned ? 2 : 1
                    });
                }
            } else {
                room.send({ message: `${prefix} ${player.name}: ${message}`, color });
            }
    
            return false;
        });
    }

    private sendTeamMessage(room: Room, player: Player, message: string) {
        for (const teammate of room.getPlayers().filter(p => p.getTeam() === player.getTeam())) {
            teammate.reply({
                message: `π ${player.name}: ${message.substring(1)}`,
                color: Color.Yellow,
                sound: 2
            });
        }
    }

    private isUsingIllegalChars(message: string) {
        const asian = (message.match(this.asianRegex) || []).length;
        const emoji = (message.match(this.emojiRegex) || []).length;
        const long = (message.match(this.longRegex) || []).length;

        if (long > 0) return true;
        if (asian > 10) return true;
        if (asian + emoji > 15) return true;

        return false;
    }

    @Command({
        name: "bb"
    })
    bbCommand($: CommandInfo, room: Room) {
        $.caller.kick("Volte sempre!");
    }
}
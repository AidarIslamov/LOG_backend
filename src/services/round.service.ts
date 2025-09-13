import { RoundCreateData } from "@/lib/types";
import { Round } from "@/models/Round";

export class RoundService {

    static async createRound(data: RoundCreateData): Promise<Round> {
        const round = await Round.create({
            duration: data.duration,
            cooldown: data.cooldown,
            startAt: new Date(data.startAt),
            endAt: new Date(data.endAt),
        });

        return round;
    }
}
import { logger } from '../app';
import { HttpClientService } from './HttpClientService';

export class OpenViduService {

    private httpClientService: HttpClientService;

	constructor(){
        this.httpClientService = new HttpClientService();
    }

	public async createSession(sessionId: string, openviduUrl: string, openviduSecret: string ): Promise<any> {
        const url = openviduUrl + '/openvidu/api/sessions';
        logger.info("Requesting session to ", url);
        const body: string = JSON.stringify({ customSessionId: sessionId});

        return await this.httpClientService.post(body, url, openviduSecret);
	}

	public async createToken(sessionId: string, openviduUrl: string, openviduSecret: string ): Promise<any> {
		const url = openviduUrl + '/openvidu/api/sessions/' + sessionId + '/connection';
        logger.info("Requesting token to ", url);
        const body: string = JSON.stringify({});

        return await this.httpClientService.post(body, url, openviduSecret);
    }
}
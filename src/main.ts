import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as Session from 'express-session';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import { json } from 'body-parser';
import * as cluster from 'cluster';
import * as OS from 'os';
const numCPUs = OS.cpus().length;
import * as _ from 'lodash';
import * as mongoStore from 'connect-mongo';
const MongoStore = mongoStore(Session);
import { get } from 'config';
import { Configuration } from './shared/configuration/configuration.enum';
import * as compression from 'compression';
import * as fileUpload from 'express-fileupload';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	// const hostDomain: string = AppModule.isDev ? `${AppModule.host}:${AppModule.port}` : AppModule.host;
    app.enable('trust proxy');
    app.use(compression());
	app.use(helmet());
	app.use(json({
		limit: '4mb',
		verify: (req: any, res, buf: Buffer, encoding: string) => {
			req.rawBody = buf;
		},
	}));
	app.use(Session({
		secret: AppModule.sessionSecret,
		resave: false,
		saveUninitialized: true,
		cookie: { secure: true },
		store: new MongoStore({ url: get(Configuration.MONGO_URI) }),
	}));

	app.use(rateLimit({
		windowMs: 1 * 60 * 1000, // 1 minute
		max: 250, // limit each IP to X requests per windowMs
    }));
    app.use(fileUpload({
        limits: {
            fileSize: 1000000 * 3 //3mb
        },
        abortOnLimit: true
    }));
    app.enableCors();
    app.useStaticAssets(join(__dirname, '..', 'public'));
    app.useStaticAssets(join(__dirname, '..', 'src-storefront/dist'));
    app.useStaticAssets(join(__dirname, '..', 'src-storefront-launcher/dist'));
    app.useStaticAssets(join(__dirname, '..', 'src-storefront/icon-fonts'));
	app.setBaseViewsDir(join(__dirname, '..', 'views'));
	app.setViewEngine('ejs');

	await app.listen(AppModule.port);
}
// bootstrap();

let serverInstance: Server;
class Server {

    constructor() {
        if (serverInstance) {
            throw new Error('Can not instantiate like this');
        }
    }

    public start(): void {
        if (process.env.NODE_ENV !== 'production') {
            this.startSingleThread();
        } else {
            this.startClusterMode();
        }
    }

    private startClusterMode(): void {
        if (cluster.isMaster) {
            /* tslint:disable */
            console.log(`Master ${process.pid} is running`);
            /* tslint:enable */
            // Fork workers.
            for (let i = 0; i < numCPUs; i++) {
              	cluster.fork();
            }
            cluster.on('exit', (worker, code, signal) => {
                /* tslint:disable */
                console.log(`worker ${worker.process.pid} died`);
                /* tslint:enable */
            });
          } else {
            // Workers can share any TCP connection
			// In this case it is an HTTP server
            bootstrap();
            /* tslint:disable */
            console.log(`Worker ${process.pid} started, port: `);
            /* tslint:enable */
          }
    }

    private startSingleThread(): void {
        bootstrap();
        /* tslint:disable */
        console.log(`Single thread started started, port: `);
        /* tslint:enable */
    }

    static getInstance(): Server {
        if (_.isNil(serverInstance)) {
            serverInstance = new Server();
        }
        return serverInstance;
    }
}

Server.getInstance().start();

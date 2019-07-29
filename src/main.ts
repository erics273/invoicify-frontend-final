import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

var buzzArr = ["Blockchain", "Big Data", "Crypto", "Superposition", "Time-box",
              "AI", "Machine Learning", "Bandwidth", "Low-hanging Fruit", "Next-gen"];
var randInt = Math.floor(Math.random() * 10) + 1;
document.getElementById("buzzwordGen").textContent = buzzArr[randInt];

platformBrowserDynamic().bootstrapModule(AppModule);

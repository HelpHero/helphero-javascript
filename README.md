<p align="center">
  <a href="https://helphero.co" target="_blank" align="center">
    <img src="https://sandbox.helphero.co/images/logo-github3.png" width="280">
  </a>
  <br />
</p>

# Official HelpHero SDK for Browsers

## Usage

To use this SDK call the default export with your HelpHero App ID.
Checkout the [Javascript docs](https://helphero.co/docs/javascript/) for full list of available methods 

```javascript
import initHelpHero from 'helphero';

const helphero = initHelpHero('<YOUR_HELPHERO_APP_ID>');
helphero.anonymous();
```

The npm package comes bundled with definitions for both TypeScript and Flow.

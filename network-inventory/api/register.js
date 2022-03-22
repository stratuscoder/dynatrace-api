// api/register.js
// used to register and test the Dynatrace URL and token

const data = require('./database.js');
const api = require('./api.js');
const express = require('express');


module.exports = function(route, app) {

    let hosts={};
    let pgis={};

    app.use(express.json());

    //get host connections
    app.post('/api/'+route, (req,res) => {       

        if (req.body && req.body.url && req.body.token) {
            //all good pass through
        } else {
            res.status(403).json({ message: 'Missing registration data.'});
            return;
        }
        url = req.body.url;
        token = req.body.token;
        timeframe = "5mins";
        pagesize = 10;

        const r = async () => {
            // use promise for all API connections
            await performActions(url, token, timeframe, pagesize);
        }

        // wait on all promises to complete to ensure we have all the data
        r().then((resp) => {
            Promise.all([pgis,hosts])
            .then((values) => {
                pg = values[0];
                ho = values[1];
                if (gl_logging) console.info("Successfully tested API.");
                if (gl_logging) console.info("PGI count is "+pg.length);
                if (gl_logging) console.info("Host count is "+ho.length);
                data.saveData(route, req.body).then(s => 
                    {
                        res.status(200).json({ message: 'Successfully registered API.'});
                    });            
            })
            .catch(error => {
                if (gl_logging) console.info(`API validation failed - ${error}`);
                if (error.message.includes('code 401')) {
                    res.status(401).json({ message: 'Check URL and Token.'});
                } else if (error.message.includes('code 400')) {
                    res.status(400).json({ message: 'Invalid format of API called.'});
                } else {                 
                    res.status(500).json({ message: 'Unauthorized - Check URL and Token.'});
                }
            });        
        });        
    });

    const performActions = async (url, token, timeframe, pagesize) =>
    {

        if (gl_logging) console.info(Date.now() + ` -> called performActions using timeframe of ${timeframe} and pagesize of ${pagesize}`);

        pgis = api.getApi(cleanUrl(url,api.API_V1_PGIS_ALL,timeframe,'',pagesize), token);
        hosts = api.getApi(cleanUrl(url,api.API_V1_HOSTS_ALL_LIMIT,timeframe,'',pagesize), token);

    }
    
    const cleanUrl = (url, path, timeframe, id, pagesize) => {
    
        let returnUrl = url + path;
        returnUrl = returnUrl.replace('{{timeframe}}',timeframe).replace('{{entityId}}',id).replace('{{pagesize}}', pagesize);
        return returnUrl;

    }

  };
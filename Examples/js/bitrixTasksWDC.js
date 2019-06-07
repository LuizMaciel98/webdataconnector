(function() {
    // Create the connector object
    var myConnector = tableau.makeConnector();

    // Define the schema
    myConnector.getSchema = function(schemaCallback) {
        var cols = [{
            id: "id",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "mag",
            alias: "magnitude",
            dataType: tableau.dataTypeEnum.float
        }, {
            id: "title",
            alias: "title",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "location",
            dataType: tableau.dataTypeEnum.geometry
        }];

        var tableSchema = {
            id: "earthquakeFeed",
            alias: "Earthquakes with magnitude greater than 4.5 in the last seven days",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    // Download the data
    myConnector.getData = function(table, doneCallback) {
        
        const express = require('express');
        const b24 = require('b24');

        const app = express()

        const bitrix24 = new b24.Bitrix24({
            config: {
                mode: "api",
                host: "your bitrix host",
                client_id : "your client id",
                client_secret : "your client secret",
                redirect_uri : "http://localhost:8888/callback"
            },
            methods: {
                async saveToken(data){
                    //Save token to database
                },
                async retriveToken(){
                    //Retrive token from database
                    return {
                        access_token: "youraccesstoken",
                        refresh_token: "yourrefreshtoken"
                    }
                }
            }
        })

        // Bitrix auth
        app.get('/auth', (req, res) => {
            res.redirect(bitrix24.auth.authorization_uri);
        });

        // Callback service parsing the authorization token and asking for the access token
        app.get('/callback', async (req, res) => {
            try{
                const code = req.query.code;
                const result = await bitrix24.auth.getToken(code);
                return res.json(result);
            }catch(err){
                console.log(err)
                return res.status(500).json({message:"Authentication Failed"});
            }
        });

        app.listen(3000, () => {
            console.log('Server started on port 3000');
        });
        
        // $.getJSON("https://inpulso.bitrix24.com.br/oauth/authorize/?client_id=local.5cf85374837866.46452596&response_type=code&redirect_uri=http://localhost:8888/callback", function(resp) {
        //     console.log('oi');
        //     console.log(resp);
        //     // var feat = resp.features,
        //     //     tableData = [];

        //     // // Iterate over the JSON object
        //     // for (var i = 0, len = feat.length; i < len; i++) {
        //     //     tableData.push({
        //     //         "id": feat[i].id,
        //     //         "mag": feat[i].properties.mag,
        //     //         "title": feat[i].properties.title,
        //     //         "location": feat[i].geometry
        //     //     });
        //     // }

        //     // table.appendRows(tableData);
        //     // doneCallback();
        // });
        
        
        
        // $.getJSON("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson", function(resp) {
        //     var feat = resp.features,
        //         tableData = [];

        //     // Iterate over the JSON object
        //     for (var i = 0, len = feat.length; i < len; i++) {
        //         tableData.push({
        //             "id": feat[i].id,
        //             "mag": feat[i].properties.mag,
        //             "title": feat[i].properties.title,
        //             "location": feat[i].geometry
        //         });
        //     }

        //     table.appendRows(tableData);
        //     doneCallback();
        // });
    };

    tableau.registerConnector(myConnector);

    // Create event listeners for when the user submits the form
    $(document).ready(function() {
        
        $("#submitButton").click(function() {
            tableau.connectionName = "USGS Earthquake Feed"; // This will be the data source name in Tableau
            tableau.submit(); // This sends the connector object to Tableau
        });
    });
})();

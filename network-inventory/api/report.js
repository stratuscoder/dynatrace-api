// api/report.js
// used to generate an HTML report of Dynatrace API data.
// this could be moved to the front end using REACT, JavaScript, etc...

const generateHTML = (c, h, p, t) => 
{

    if (gl_logging) console.info(Date.now() + " -> called generateHTML with data for connections ... :"+JSON.stringify(c, null, 2).substring(0,400));
    if (gl_logging) console.info(Date.now() + " -> called generateHTML with data for hosts ... :"+JSON.stringify(h, null, 2).substring(0,400));
    if (gl_logging) console.info(Date.now() + " -> called generateHTML with data for pgis ... :"+JSON.stringify(p, null, 2).substring(0,400));
    
    //pgis are correctly formated
    let pgis = p;

    //hosts need to be mapped base on entities element
    //let hosts = h.entities.map(h => h);
    let hosts = h;

    //pull name of matching pgi
    const getNameOfPGI = (id) => {
      try {
        let m = pgis.filter(o => o.entityId == id);
        if (m == undefined || m[0] == undefined) {
          return id;
        } else {
          if (gl_logging) console.info("PGI name: "+ m[0].displayName);          
          return m[0].displayName;
        }
      } catch(e){
        if (gl_logging) console.info("PGI error: "+ e);
      }
    }

    //pull software technologies of matching pgi
    const getTechnologiesOfPGIText = (id) => {
        let m = pgis.filter(o => o.entityId == id);
        if (m == undefined || m[0] == undefined) {
          return "";
        }
        if (m[0].softwareTechnologies){
            let st = " and uses software technologies: ";
            m[0].softwareTechnologies.forEach(function(ste){
                st += ste.type+" "+ste.version+",";
            })
            return st = st.substring(0,st.length-1).replaceAll(' null','');
        } else {
            return "";
        }
    }

    //pull software technologies of matching pgi
    const getTechnologiesOfPGI = (id) => {
      let m = pgis.filter(o => o.entityId == id);
      if (m == undefined || m[0] == undefined) {
        return "";
      }
      if (m[0].softwareTechnologies){
          let st = "";
          m[0].softwareTechnologies.forEach(function(ste){
              st += ste.type+" "+ste.version+",";
          })
          return st = st.substring(0,st.length-1).replaceAll(' null','');
      } else {
          return "";
      }
    }

    //pull listening ports of matching pgi with text
    const getPortsOfPGIText = (id) => {
        let m = pgis.filter(o => o.entityId == id);
        if (m == undefined || m[0] == undefined) {
          return "";
        }
        if (m[0].listenPorts){
            return " and listens on ports: "+m[0].listenPorts.toString().replace(',',', ');
        } else {
            return "";
        }
    }

    //pull listening ports of matching pgi
    const getPortsOfPGI = (id) => {
        let m = pgis.filter(o => o.entityId == id);
        if (m == undefined || m[0] == undefined) {
          return "";
        }
        if (m[0].listenPorts){
            return m[0].listenPorts.toString().replace(',',', ');
        } else {
            return "";
        }
    }

    //has listening ports of matching pgi
    const hasPortsOfPGI = (id) => {
      let m = pgis.filter(o => o.entityId == id);
      if (m == undefined || m[0] == undefined) {
        return false;
      } else if (m[0].listenPorts){
          return true;
      } else {
          return false;
      }
    }

    // get host name
    const getNameOfHost = (id) => {
      try {
        let m = hosts.filter(o => o.entityId == id);
        if (m == undefined || m[0] == undefined) {
          return id;
        } else {
          if (gl_logging) console.info("HOST name: "+ m[0].displayName);          
          return m[0].displayName;
        }
      } catch(e){
        if (gl_logging) console.info("HOST error: "+ e);
      }
    }

    //init report
    const initReport = (timeframe) => {
      return `
        <div class="table-responsive">
            <h3>Timeframe selected is last ${timeframe}</h3>
            <p>Click on the primary rows to toggle the detailed rows.</p>
            <table id="api-data" class="table table-hover table-light table-bordered table-condensed" style="font-family: sans-serif;font-size: 10px;font-weight: 600;">
                <thead>
                <tr class="table-active ">
                    <th scope="col" class="text-left">#</th>
                    <th scope="col" class="text-left">ICON</th>
                    <th scope="col" class="text-left">Host name/Process name</th>
                    <th scope="col" class="text-left">Details</th>
                    <th scope="col" class="text-left">From</th>
                    <th scope="col" class="text-left">To</th>
                    <th scope="col" class="text-left">Ports</th>
                    <th scope="col" class="text-left">Technologies</th>                  
                </tr>
                </thead>
                <tbody>
                {{contentRows}}
                </tbody>
            </table>
        </div>`;
    }
    
    //set row content
    const setRowContent = (idx, id, icon, name, details, trafficFrom, trafficTo, ports, techs) => {
      rowTemplates = [ 
      //host
      `
      <tr class="table-primary" data-toggle="collapse" data-target="#r${id}" class="accordion-toggle ">
        <td class="text-left">${id}</td>
        <td class="text-left"><i class="${icon}"></i></td>
        <td class="text-left tableexport-string">${name}</td>
        <td class="text-left tableexport-string">${details}</td>
        <td colspan="3"></td>
        <td>⤵️</td>
      </tr>`,
      //subhostto
      `
      <tr class="table-light hiddenRow accordion-body collapse " id="r${id}">
      <td class="text-left"></td>
      <td class="text-left"><i class="${icon}"></i></td>
      <td class="text-left tableexport-string">${name}</td>
      <td class="text-left tableexport-string">${details}</td>
      <td class="tableexport-string" colspan="3"></td>
      <td class="tableexport-string"></td>
      </tr>`,
      //subhostfrom
      `
      <tr class="table-light hiddenRow accordion-body collapse " id="r${id}">
      <td class="text-left"></td>
      <td class="text-left"><i class="${icon}"></i></td>
      <td class="text-left tableexport-string">${name}</td>
      <td class="text-left tableexport-string">${details}</td>
      <td class="text-left tableexport-string">${trafficFrom}</td>
      <td class="text-left tableexport-string">${trafficTo}</td>
      <td class="text-left tableexport-string">${ports}</td>
      <td class="text-left tableexport-string">${techs}</td>
      </tr>`,
      //pgi no ports
      `
      <tr class="table-light hiddenRow accordion-body collapse " id="r${id}">
      <td class="text-left"></td>
      <td class="text-left"><i class="${icon}"></i></td>
      <td class="text-left tableexport-string">${name}</td>
      <td class="text-left tableexport-string">${details}</td>
      <td class="text-left tableexport-string">${trafficFrom}</td>
      <td class="text-left tableexport-string">${trafficTo}</td>
      <td class="text-left tableexport-string"></td>
      <td class="text-left tableexport-string"></td>
      </tr>`,
      //pgi ports
      `
      <tr class="table-light hiddenRow accordion-body collapse " id="r${id}">
      <td class="text-left"></td>
      <td class="text-left"><i class="${icon}"></i> <i class="bi-arrow-bar-left"></i></td>
      <td class="text-left tableexport-string">${name}</td>
      <td class="text-left tableexport-string">${details}</td>
      <td class="text-left tableexport-string">${trafficFrom}</td>
      <td class="text-left tableexport-string">${trafficTo}</td>
      <td class="text-left tableexport-string">${ports}</td>
      <td class="text-left tableexport-string">${techs}</td>
      </tr>`];

      return rowTemplates[idx];

    }

    //build the report and send it back to client
    id = 0;
    let htmlTable = initReport(t);
    let contentRows = "";
    let primaryRows = "";
    let secondaryRows = "";
    let trafficFrom = "";
    let trafficTo = "";
    let dName = "";
    let index = 0;

    c.forEach(function(host) {
        id++;
        dName = host.displayName == undefined ? 'Unknown' : host.displayName;
        //add top level row
        primaryRows = setRowContent(0,id,"bi-pc", dName,`This host runs OS:: ${host.osType}, ${host.osArchitecture}, ${host.osVersion} using ${host.consumedHostUnits} HU's`,"+","+","+","+");

        index = 2;
        //add from relationships rows
        if (host.fromRelationships && host.fromRelationships.isNetworkClientOfHost){
            host.fromRelationships.isNetworkClientOfHost.forEach(function (thisHost){
              trafficTo = getNameOfHost(thisHost);
              trafficFrom = dName;
              secondaryRows += setRowContent(index,id,"bi-arrow-bar-right","",`This host sends traffic to ${trafficTo}.`,trafficFrom,trafficTo,"","");
            });    
        }

        if (host.toRelationships && host.toRelationships.isNetworkClientOfHost){
          host.toRelationships.isNetworkClientOfHost.forEach(function (thisHost){
            trafficTo = dName;
            trafficFrom = getNameOfHost(thisHost);
            secondaryRows += setRowContent(index,id,"bi-arrow-bar-left","",`This host recieves traffic from ${trafficFrom}.`,trafficFrom,trafficTo,"","");
          });    
        }

        //add to relationships
        if (host.toRelationships && host.toRelationships.isProcessOf){
            host.toRelationships.isProcessOf.forEach(function (toProcess){                 
              if (hasPortsOfPGI(toProcess) == true) { index = 4; } else { index = 3;}
   
              secondaryRows += setRowContent(index,id,"bi-code-square",getNameOfPGI(toProcess),
              `This process runs on ${dName}${getPortsOfPGIText(toProcess)}${getTechnologiesOfPGIText(toProcess)}.`,
              dName,dName,
              getPortsOfPGI(toProcess),
              getTechnologiesOfPGI(toProcess));
            });
        }
        contentRows += primaryRows + secondaryRows;
    });
            
    return htmlTable.replace('{{contentRows}}',contentRows);
}        

module.exports = { generateHTML };

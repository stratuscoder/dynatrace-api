
gToken = "";
gUrl = "";
gReport = "";
gTimeframe = "3days";

function isDynatraceToken(str) {
    if (str ==='' || str.trim() ===''){ 
        return "API Token is required."; 
    }
    try {
        parts = str.split('.');
        if (parts.length != 3) {
            return "API Token format is not valid."; 
        }
        if (parts[0] != 'dt0c01') {
            return "API Token format is not valid, it should start with dt0c01."; 
        }
        if (parts[1].length != 24) {
            return "API Token format is not valid, 2nd section must contain 24 characters"; 
        }
        if (parts[2].length != 64) {
            return "API Token format is not valid, 3rd section must contain 64 characters"; 
        }
    } catch (err) {
        return "API Token format is not valid."; 
    }
    return "";
}

function isDynatraceUrl(str) {
    if (str ==='' || str.trim() ===''){ 
        return "API Url is required."; 
    }
    if(str.indexOf(".live.dynatrace.com") == -1)
    {
        return "API Url format is not valid, Example of a valid format https://xxx99999.live.dynatrace.com/"; 
    }
    return "";
}

function setTextMessage(id, message){
    $(id).text(message);
}

function setHTMLModal(message, hide){
    id = "#messageModal";
    $("#messageModalContent").html(message);
    $(id).modal('show');
    if (hide) setTimeout(() => {$(id).modal('hide')},3000);            
}

function setHTMLMessage(id, message, hide){
    $(id).show();   
    $(id).html(message);
    if (hide) setTimeout(() => {$(id).fadeOut()},4000);            
}

function setHTMLContent(id, message, hide){
    $(id).show();   
    //$(id).fadeIn();   
    $(id).html(message);
    if (hide) setTimeout(() => {$(id).fadeOut()},4000);            
}

function setUI(config){
  $("#hero").removeClass("hero-full");
  $("#hero").removeClass("hero-top");
  if (config == "top"){
    $("#hero").addClass("hero-top");

  }
  if (config == "full"){
    $("#hero").addClass("hero-full");
  }
}

function setHTMLSpinner(id, hide){
    html = `<div className="text-center">
                <div class="spinner-border text-secondary" role="status">
                    <span class="visually-hidden"></span>
                </div>
            </div>`;
    setHTMLMessage(id, html, hide)
}

function setTimeframe(value, text){
    gTimeframe = value;
    setHTMLModal("Timeframe has been set to "+text, true);
    return false;
}

function createPDF(id) {
    var sTable = document.getElementById(id).innerHTML;
    var style = `
    <style>
      body { margin: 0;
        font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
        color: #212529;
        text-align: left;
        background-color: #fff;
      }
      table {width: 100%;}table, th, td {border: solid 1px #DDD; border-collapse: collapse;padding: 2px 3px;}
    </style>`;

    // CREATE A WINDOW OBJECT.    
    var win = window.open('', '_blank', 'height=700,width='+window.innerWidth);

    win.document.write('<html><head>');
    win.document.write('<title>API Data</title>');
    win.document.write(style);
    win.document.write('</head>');
    win.document.write('<body>');
    win.document.write(sTable);
    win.document.write('</body></html>');
    win.alert('Pick Landscape, then set scale to 50 when print page pops up for correct PDF format.')
    win.document.close();
    win.print();
}

function pullReport(){
    setUI("full");
    $("#exporters").hide();
    if (gUrl + gToken == "") {
        setHTMLModal("Registration is required.", true);
        return false;
    }
    setUI("top");
    setHTMLSpinner("#instructions",false)
    setHTMLMessage("#reporting","",false);
    $.ajax({
        type: "GET",
        url: "/api/reporting?url="+gUrl+"&token="+gToken+"&timeframe="+gTimeframe,
        success: function (res) {
            gReport = "*";
            $("#exporters").show();
            setHTMLMessage("#reporting",res, false);
            setHTMLMessage("#instructions","", false);  
            $('#api-data').tableExport({
                headers: true,
                footers: true,
                filename: 'inventory',            
                sheetname: 'Sheet1',
                formats: ['xls','csv'],
                position: "well",
                bootstrap: false,
                trimWhitespace: false,
                exportButtons: false,
                ignoreCols:1, 
            });
        }
    });
}

if ($('.accordian-body')) {
    $('.accordian-body').on('show.bs.collapse', function () {
        $(this).closest("table")
            .find(".collapse.in")
            .not(this)
            .collapse('toggle')
    })
}

document.getElementById("actionButton").addEventListener('click', function(e){
    setUI("full");
    url = $("#url").val();
    token = $("#token").val();
    checkUrl = isDynatraceUrl(url);
    checkToken = isDynatraceToken(token);
    setTextMessage("#urlMessage",checkUrl);
    setTextMessage("#tokenMessage",checkToken);
    if (checkUrl+checkToken != ""){
        return false;
    }
    let data = JSON.stringify({ 'url' : url, 'token' : token });
    gToken = token;
    gUrl = url;
    console.log(data);
    //using jquery to send post to api
    $.ajax({
        url: "/api/register",
        type: "POST",
        dataType: 'json',
        contentType: 'application/json',
        data: data,
        processData: false,
        success: function (data) {
            console.log("1)"+data);
            $("#actionButton").remove();
            setTextMessage("#message","Successfully Registered the API.");
            setHTMLModal("Successfully Registered the API, ready for reporting.", true);
            $("#modalSubscriptionForm").modal('hide');
        },
        cache: false
    }).fail(function(xhr, textStatus, error) {
        if (xhr.status == 400) {
            setTextMessage("#errorMessage",`Error: ${error}, Invalid data passed to API on backend, inform app developer.`);
        } else if (xhr.status == 401) {
            setTextMessage("#errorMessage",`Error: ${error}, Invalid URL/Credentials/Permissions.`);
        } else if (xhr.status == 403) {
            setTextMessage("#errorMessage",`Error: ${error}, Missing valid registration data.`);
        } else if (xhr.status == 500) {
            setTextMessage("#errorMessage",`Error: ${error}, Check licensing consumption.`);            
        } else {
            setTextMessage("#errorMessage",`Error: ${error}, Unexpected error.`);            
        }
    });
    e.preventDefault();
});
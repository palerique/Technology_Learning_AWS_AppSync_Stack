var stats = {
    type: "GROUP",
name: "Global Information",
path: "",
pathFormatted: "group_missing-name-b06d1",
stats: {
    "name": "Global Information",
    "numberOfRequests": {
        "total": "3000",
        "ok": "3000",
        "ko": "0"
    },
    "minResponseTime": {
        "total": "402",
        "ok": "402",
        "ko": "-"
    },
    "maxResponseTime": {
        "total": "12192",
        "ok": "12192",
        "ko": "-"
    },
    "meanResponseTime": {
        "total": "3565",
        "ok": "3565",
        "ko": "-"
    },
    "standardDeviation": {
        "total": "3499",
        "ok": "3499",
        "ko": "-"
    },
    "percentiles1": {
        "total": "979",
        "ok": "979",
        "ko": "-"
    },
    "percentiles2": {
        "total": "7606",
        "ok": "7606",
        "ko": "-"
    },
    "percentiles3": {
        "total": "8957",
        "ok": "8957",
        "ko": "-"
    },
    "percentiles4": {
        "total": "9327",
        "ok": "9327",
        "ko": "-"
    },
    "group1": {
    "name": "t < 800 ms",
    "count": 1225,
    "percentage": 41
},
    "group2": {
    "name": "800 ms < t < 1200 ms",
    "count": 424,
    "percentage": 14
},
    "group3": {
    "name": "t > 1200 ms",
    "count": 1351,
    "percentage": 45
},
    "group4": {
    "name": "failed",
    "count": 0,
    "percentage": 0
},
    "meanNumberOfRequestsPerSecond": {
        "total": "44.118",
        "ok": "44.118",
        "ko": "-"
    }
},
contents: {
"req_list-all-commen-89e14": {
        type: "REQUEST",
        name: "list all comments",
path: "list all comments",
pathFormatted: "req_list-all-commen-89e14",
stats: {
    "name": "list all comments",
    "numberOfRequests": {
        "total": "3000",
        "ok": "3000",
        "ko": "0"
    },
    "minResponseTime": {
        "total": "402",
        "ok": "402",
        "ko": "-"
    },
    "maxResponseTime": {
        "total": "12192",
        "ok": "12192",
        "ko": "-"
    },
    "meanResponseTime": {
        "total": "3565",
        "ok": "3565",
        "ko": "-"
    },
    "standardDeviation": {
        "total": "3499",
        "ok": "3499",
        "ko": "-"
    },
    "percentiles1": {
        "total": "979",
        "ok": "979",
        "ko": "-"
    },
    "percentiles2": {
        "total": "7606",
        "ok": "7606",
        "ko": "-"
    },
    "percentiles3": {
        "total": "8957",
        "ok": "8957",
        "ko": "-"
    },
    "percentiles4": {
        "total": "9327",
        "ok": "9327",
        "ko": "-"
    },
    "group1": {
    "name": "t < 800 ms",
    "count": 1225,
    "percentage": 41
},
    "group2": {
    "name": "800 ms < t < 1200 ms",
    "count": 424,
    "percentage": 14
},
    "group3": {
    "name": "t > 1200 ms",
    "count": 1351,
    "percentage": 45
},
    "group4": {
    "name": "failed",
    "count": 0,
    "percentage": 0
},
    "meanNumberOfRequestsPerSecond": {
        "total": "44.118",
        "ok": "44.118",
        "ko": "-"
    }
}
    }
}

}

function fillStats(stat){
    $("#numberOfRequests").append(stat.numberOfRequests.total);
    $("#numberOfRequestsOK").append(stat.numberOfRequests.ok);
    $("#numberOfRequestsKO").append(stat.numberOfRequests.ko);

    $("#minResponseTime").append(stat.minResponseTime.total);
    $("#minResponseTimeOK").append(stat.minResponseTime.ok);
    $("#minResponseTimeKO").append(stat.minResponseTime.ko);

    $("#maxResponseTime").append(stat.maxResponseTime.total);
    $("#maxResponseTimeOK").append(stat.maxResponseTime.ok);
    $("#maxResponseTimeKO").append(stat.maxResponseTime.ko);

    $("#meanResponseTime").append(stat.meanResponseTime.total);
    $("#meanResponseTimeOK").append(stat.meanResponseTime.ok);
    $("#meanResponseTimeKO").append(stat.meanResponseTime.ko);

    $("#standardDeviation").append(stat.standardDeviation.total);
    $("#standardDeviationOK").append(stat.standardDeviation.ok);
    $("#standardDeviationKO").append(stat.standardDeviation.ko);

    $("#percentiles1").append(stat.percentiles1.total);
    $("#percentiles1OK").append(stat.percentiles1.ok);
    $("#percentiles1KO").append(stat.percentiles1.ko);

    $("#percentiles2").append(stat.percentiles2.total);
    $("#percentiles2OK").append(stat.percentiles2.ok);
    $("#percentiles2KO").append(stat.percentiles2.ko);

    $("#percentiles3").append(stat.percentiles3.total);
    $("#percentiles3OK").append(stat.percentiles3.ok);
    $("#percentiles3KO").append(stat.percentiles3.ko);

    $("#percentiles4").append(stat.percentiles4.total);
    $("#percentiles4OK").append(stat.percentiles4.ok);
    $("#percentiles4KO").append(stat.percentiles4.ko);

    $("#meanNumberOfRequestsPerSecond").append(stat.meanNumberOfRequestsPerSecond.total);
    $("#meanNumberOfRequestsPerSecondOK").append(stat.meanNumberOfRequestsPerSecond.ok);
    $("#meanNumberOfRequestsPerSecondKO").append(stat.meanNumberOfRequestsPerSecond.ko);
}

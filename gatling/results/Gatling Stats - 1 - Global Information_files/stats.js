var stats = {
    type: "GROUP",
name: "Global Information",
path: "",
pathFormatted: "group_missing-name-b06d1",
stats: {
    "name": "Global Information",
    "numberOfRequests": {
        "total": "3000",
        "ok": "2438",
        "ko": "562"
    },
    "minResponseTime": {
        "total": "491",
        "ok": "491",
        "ko": "40005"
    },
    "maxResponseTime": {
        "total": "60002",
        "ok": "43920",
        "ko": "60002"
    },
    "meanResponseTime": {
        "total": "17875",
        "ok": "12763",
        "ko": "40048"
    },
    "standardDeviation": {
        "total": "15137",
        "ok": "11930",
        "ko": "842"
    },
    "percentiles1": {
        "total": "14074",
        "ok": "6749",
        "ko": "40013"
    },
    "percentiles2": {
        "total": "34168",
        "ok": "22985",
        "ko": "40015"
    },
    "percentiles3": {
        "total": "40015",
        "ok": "35613",
        "ko": "40019"
    },
    "percentiles4": {
        "total": "40019",
        "ok": "39070",
        "ko": "40022"
    },
    "group1": {
    "name": "t < 800 ms",
    "count": 188,
    "percentage": 6
},
    "group2": {
    "name": "800 ms < t < 1200 ms",
    "count": 129,
    "percentage": 4
},
    "group3": {
    "name": "t > 1200 ms",
    "count": 2121,
    "percentage": 71
},
    "group4": {
    "name": "failed",
    "count": 562,
    "percentage": 19
},
    "meanNumberOfRequestsPerSecond": {
        "total": "32.609",
        "ok": "26.5",
        "ko": "6.109"
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
        "ok": "2438",
        "ko": "562"
    },
    "minResponseTime": {
        "total": "491",
        "ok": "491",
        "ko": "40005"
    },
    "maxResponseTime": {
        "total": "60002",
        "ok": "43920",
        "ko": "60002"
    },
    "meanResponseTime": {
        "total": "17875",
        "ok": "12763",
        "ko": "40048"
    },
    "standardDeviation": {
        "total": "15137",
        "ok": "11930",
        "ko": "842"
    },
    "percentiles1": {
        "total": "14074",
        "ok": "6749",
        "ko": "40013"
    },
    "percentiles2": {
        "total": "34168",
        "ok": "22985",
        "ko": "40015"
    },
    "percentiles3": {
        "total": "40015",
        "ok": "35613",
        "ko": "40019"
    },
    "percentiles4": {
        "total": "40019",
        "ok": "39070",
        "ko": "40022"
    },
    "group1": {
    "name": "t < 800 ms",
    "count": 188,
    "percentage": 6
},
    "group2": {
    "name": "800 ms < t < 1200 ms",
    "count": 129,
    "percentage": 4
},
    "group3": {
    "name": "t > 1200 ms",
    "count": 2121,
    "percentage": 71
},
    "group4": {
    "name": "failed",
    "count": 562,
    "percentage": 19
},
    "meanNumberOfRequestsPerSecond": {
        "total": "32.609",
        "ok": "26.5",
        "ko": "6.109"
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

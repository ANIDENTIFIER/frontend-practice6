const state = { data: null };

const loadData = async () => {
    $('#status').text("加载中...").show();
    try {
        const response = await fetch("data\\studyrooms.json");
        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }
        const raw_data = await response.json();
        if (raw_data.rooms.length === 0) {
            $("#status").text("暂无数据").show();
            return;
        }

        state.data = {
            buildings: ["楠苑", "梓苑", "图书馆", "理科楼", "文科楼"],
            series: {
                available:   [0, 0, 0, 0, 0],
                occupied:    [0, 0, 0, 0, 0],
                unavailable: [0, 0, 0, 0, 0],
            }
        };
        raw_data.rooms.forEach(room => {
            if (room.status === "开放") {
                state.data.series.available[state.data.buildings.indexOf(room.building)] += room.seats - room.occupied;
                state.data.series.occupied[state.data.buildings.indexOf(room.building)] += room.occupied;
            } else {
                state.data.series.unavailable[state.data.buildings.indexOf(room.building)] += room.seats;
            }
        });

        $("#sub-title").text(raw_data.title + " · 数据来源：课程统一数据集（教学演示数据，非真实统计）");
        $("#status").hide();
        renderCards(raw_data);
        renderBarChart(state.data);
        renderLineChart(state.data);
    } catch (error) {
        $("#status")
            .text("加载失败：" + error.message)
            .show();
    }
}

const renderCards = (data) => {
    const total_used = {
        "楠苑": [0, 0], 
        "梓苑": [0, 0], 
        "图书馆": [0, 0], 
        "理科楼": [0, 0], 
        "文科楼": [0, 0],
    };

    data.rooms
        .filter(room => room.status === "开放")
        .forEach(room => {
            total_used[room.building][0] += room.occupied;
            total_used[room.building][1] += room.seats;
        });

    Object.entries(total_used).forEach(([key, value]) => {
        $("#cards").append(`
        <div class="col-md-4">
            <div class="card">
            <div class="card-body">
                <h3 class="card-title h6">${key}</h3>
                <p class="card-text fs-4">${value[0]} / ${value[1]}</p>
                <p class="card-text small text-muted">已使用 / 座位总数</p>
            </div>
            </div>
        </div>
        `);
    });
};

let barChart = null;

const renderBarChart = (data) => {
    if (barChart === null) {
        barChart = echarts.init(document.querySelector("#bar-chart"));
    }

    const i18n = {
        "available" : "可用",
        "occupied" : "占用中",
        "unavailable" : "禁止使用",
    };

    barChart.setOption({
        title: { text: "各图书馆座位使用情况", left: "center" },
        tooltip: { trigger: "axis" },
        legend: { bottom: 0 },
        xAxis: { data: data.buildings },
        yAxis: { name: "个" },
        series: Object.entries(data.series).map(([key, value]) =>({
            name: i18n[key],
            type: "bar",
            data: value,
        })),
    });
};

let lineChart = null;

const renderLineChart = (data) => {
    if (lineChart !== null) {
        lineChart.destroy(); // 防重复初始化
    }
    const ctx = document.querySelector("#pie-chart");
    lineChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["可用", "已占用", "暂停使用"],
            datasets: [
                {
                    data: [
                        data.series.available.reduce((sum, n) => sum + n, 0),
                        data.series.occupied.reduce((sum, n) => sum + n, 0),
                        data.series.unavailable.reduce((sum, n) => sum + n, 0),
                    ],
                    backgroundColor: [
                    "#5470C6", // 绿色：可用
                    "#FAC858", // 蓝色：占用
                    "#6c757d", // 灰色：暂停使用
                    ],
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: "图书馆座位使用情况" },
            },
        },
    });
};

window.addEventListener("resize", () => {
    if (barChart) barChart.resize();
    // Chart.js响应式默认自动处理，无需手动
});

$('#cards').on('click', '.card', function () {  
  $(this).toggleClass('border-primary shadow');
});

loadData();
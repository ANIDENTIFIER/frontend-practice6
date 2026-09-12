const state = { data: null };

const loadData = async () => {
    $('#status').text("加载中...").show();
    try {
        const response = await fetch("data\\studyrooms.json");
        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }
        const data = await response.json();
        if (data.rooms.length === 0) {
            $("#status").text("暂无数据").show();
            return;
        }
        state.data = data;
        $("#sub-title").text(data.title + " · 数据来源：课程统一数据集（教学演示数据，非真实统计）");
        $("#status").hide();
        renderCards(data);
        renderBarChart(data);
        renderLineChart(data);
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


    data.rooms.forEach(room => {
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

loadData();
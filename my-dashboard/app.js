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

loadData();
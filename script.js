const { jsPDF } = window.jspdf;

const moduleData = {
    DSA: { code: "ITU07313", lecturer: "DR. AHMED KIJAZI" },
    DMA: { code: "ITU07307", lecturer: "MLEKWA KIKWEMBO" },
    EI: { code: "BAU07313", lecturer: "LUSAKO MWAKILUMA"},
    MS: { code: "ITU07311", lecturer: "KELVIN MBUYA"},
    PJ: { code: "ITU07312", lecturer: "Dr. AHMED KIJAZI"},
    MC: { code: "ITU07314", lecturer: "JOSEPH HAULE"}

};

const membersBody = document.getElementById("members");

document.getElementById("moduleName").addEventListener("change", e => {
    const m = moduleData[e.target.value];
    document.getElementById("moduleCode").value = m ? m.code : "";
    document.getElementById("lecturerName").value = m ? m.lecturer : "";
});

function addMember() {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td></td>
        <td><input class="m-name" required></td>
        <td><input class="m-reg" required></td>
        <td>
            <button type="button" onclick="this.closest('tr').remove(); updateSN()">✖</button>
        </td>
    `;
    membersBody.appendChild(row);
    updateSN();
}

function updateSN() {
    [...membersBody.children].forEach((row, i) => {
        row.children[0].innerText = i + 1;
    });
}

addMember(); // default one row

function collectData() {
    const form = document.getElementById("groupForm");
    if (!form.checkValidity()) {
        alert("Fill all required fields");
        return null;
    }

    return {
        course: course.value.trim().toUpperCase(),
        moduleName: moduleName.options[moduleName.selectedIndex].text.toUpperCase(),
        moduleCode: moduleCode.value.toUpperCase(),
        lecturerName: lecturerName.value.toUpperCase(),
        submissionDate: submissionDate.value,
        stream: stream.value.trim().toUpperCase(),
        groupNo: groupNo.value.trim().toUpperCase(),
        members: [...membersBody.children].map(r => ({
            name: r.querySelector(".m-name").value.trim().toUpperCase(),
            reg: r.querySelector(".m-reg").value.trim().toUpperCase()
        }))
    };
}

/* PREVIEW */
function previewPDF() {
    const d = collectData();
    if (!d) return;

    let html = `
        <p><b>COURSE:</b> ${d.course}</p>
        <p><b>MODULE:</b> ${d.moduleName}</p>
        <p><b>GROUP NO:</b> ${d.groupNo}</p>
        <hr>
    `;

    d.members.forEach((m, i) => {
        html += `<p>${i + 1}. ${m.name} (${m.reg})</p>`;
    });

    document.getElementById("previewContent").innerHTML = html;
    document.getElementById("preview").style.display = "flex";
}

function closePreview() {
    document.getElementById("preview").style.display = "none";
}

/* PDF GENERATION */
document.getElementById("groupForm").onsubmit = e => {
    e.preventDefault();
    const d = collectData();
    if (!d) return;

    const doc = new jsPDF("p", "mm", "a4");
    const w = doc.internal.pageSize.getWidth();

    // FRAME
    doc.setLineWidth(1.5);
    doc.rect(10, 10, w - 20, 277);
    doc.setLineWidth(0.5);
    doc.rect(14, 14, w - 28, 269);

    // TITLE
    doc.setFont("Times", "Bold");
    doc.setFontSize(22);
    doc.text("COLLEGE OF BUSINESS EDUCATION", w / 2, 30, { align: "center" });

    // LOGO
    doc.addImage("logo.png", "PNG", w / 2 - 35, 40, 70, 45);

    let y = 100;
    doc.setFontSize(14);

    function row(label, value) {
        doc.setFont("Times", "Bold");
        doc.text(label, 30, y);
        doc.setFont("Times", "Normal");
        doc.text(value, 90, y);
        y += 12;
    }

    row("COURSE:", d.course);
    row("MODULE NAME:", d.moduleName);
    row("MODULE CODE:", d.moduleCode);
    row("LECTURER NAME:", d.lecturerName);
    row("NATURE OF WORK:", "GROUP");
    row("SUBMISSION DATE:", d.submissionDate);
    row("STREAM:", d.stream);
    row("GROUP NO:", d.groupNo);

    y += 8;
    doc.autoTable({
        startY: y,
        head: [["S/N", "MEMBER NAME", "REGISTRATION NUMBER"]],
        body: d.members.map((m, i) => [i + 1, m.name, m.reg]),
        styles: { font: "Times", margin: 10 }
    });

    doc.save(`${d.course}_GROUP_${d.groupNo}_COVER_PAGE.pdf`);
};

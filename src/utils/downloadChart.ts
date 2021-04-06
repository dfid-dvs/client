import FileSaver from 'file-saver';
import html2canvas from 'html2canvas';

export default async function handleChartDownload(
    divRef: React.RefObject<HTMLDivElement>,
    title = 'test',
    className: string,
) {
    if (divRef?.current) {
        const actions = divRef.current
            .getElementsByClassName(className)[0] as HTMLDivElement;
        if (actions) {
            actions.style.display = 'none';
        }
        const png = await html2canvas(
            divRef.current,
        ).then(canvas => canvas.toDataURL('image/png', 1.0));

        await FileSaver.saveAs(png, `${title}.png`);

        if (actions) {
            actions.style.display = 'flex';
        }
    }
}

import React, { useState, useEffect } from 'react';

// このバージョンでは、デザインをシンプルにするため、外部アイコンライブラリは使いません。

const WasteCollectionForm = () => {
    const [formData, setFormData] = useState({
        requester: '蒲池', customerName: '', address: '', phone: '',
        recoveryDate1: '', recoveryDate2: '', recoveryDate3: '',
        details: '', siteVisit: '不要'
    });
    const [wasteItems, setWasteItems] = useState({});
    const [freeWasteItem, setFreeWasteItem] = useState({ name: '', weight: '', quantity: '' });
    const [mailContent, setMailContent] = useState('');
    const [totalWeight, setTotalWeight] = useState(0);

    const wasteData = [
        { id: 'desktop', name: 'デスクトップPC（モニタ含む）', weight: 15 },
        { id: 'laptop', name: 'ノートパソコン', weight: 2 },
        { id: 'printer-sg3300', name: 'インクジェットプリンター (リコー SG 3300)', weight: 10.5, options: [ { id: 'manual-tray-3300', name: '↳ 手差しトレイ', weight: 1.5 }, { id: 'additional-tray-3300', name: '↳ 増設トレイ', weight: 3 } ] },
        { id: 'printer-sg5200', name: 'インクジェットプリンター (リコー SG 5200)', weight: 16, options: [ { id: 'manual-tray-5200', name: '↳ 手差しトレイ', weight: 1.5 }, { id: 'additional-tray-5200', name: '↳ 増設トレイ', weight: 3 } ] },
        { id: 'laser-printer', name: '一般的なレーザープリンタ', weight: 20 },
        { id: 'ups', name: '無停電電源装置（UPS）', weight: 10 }
    ];

    const requesters = ['蒲池', '濱田', '原田', '松原', '吉田'];

    useEffect(() => {
        let total = 0;
        wasteData.forEach(item => {
            const quantity = wasteItems[item.id] || 0;
            total += quantity * item.weight;
            if (item.options) {
                item.options.forEach(option => {
                    const optionQuantity = wasteItems[`${item.id}-${option.id}`] || 0;
                    total += optionQuantity * option.weight;
                });
            }
        });
        if (freeWasteItem.weight && freeWasteItem.quantity) {
            total += parseFloat(freeWasteItem.weight) * parseInt(freeWasteItem.quantity, 10);
        }
        setTotalWeight(Math.round(total * 10) / 10);
    }, [wasteItems, freeWasteItem]);

    const handleWasteItemChange = (itemId, value) => {
        const newWasteItems = { ...wasteItems, [itemId]: parseInt(value, 10) || 0 };
        const itemConfig = wasteData.find(d => d.id === itemId.split('-')[0]);
        if (itemConfig && itemConfig.options && parseInt(value, 10) === 0) {
             itemConfig.options.forEach(option => {
                newWasteItems[`${itemConfig.id}-${option.id}`] = 0;
             });
        }
        setWasteItems(newWasteItems);
    };
    
    const handleFormChange = (field, value) => setFormData(p => ({ ...p, [field]: value }));
    const handleFreeWasteChange = (field, value) => setFreeWasteItem(p => ({ ...p, [field]: value }));

    const generateMail = () => {
        if (!formData.customerName || !formData.address || !formData.phone) { alert('得意先名、住所、電話番号をすべて入力してください。'); return; }
        let itemsList = '';
        wasteData.forEach(item => {
            const quantity = wasteItems[item.id] || 0;
            if (quantity > 0) {
                itemsList += `- ${item.name}: ${quantity}台\n`;
                if (item.options) {
                    item.options.forEach(option => {
                        const optionQuantity = wasteItems[`${item.id}-${option.id}`] || 0;
                        if (optionQuantity > 0) itemsList += `  + ${option.name.replace('↳ ', '')}: ${optionQuantity}台\n`;
                    });
                }
            }
        });
        if (freeWasteItem.name && freeWasteItem.quantity > 0) { itemsList += `(その他)\n- ${freeWasteItem.name}: ${freeWasteItem.quantity}個\n`; }
        if (itemsList.trim() === '') { alert('廃棄品目を1つ以上選択または入力してください。'); return; }
        let recoveryDatesText = '';
        ['1', '2', '3'].forEach(i => { if (formData[`recoveryDate${i}`]) recoveryDatesText += `第${i}希望日： ${formData[`recoveryDate${i}`]}\n`; });
        if (!recoveryDatesText) { alert('回収希望日を1つ以上選択してください。'); return; }
        const siteVisitRequestText = formData.siteVisit === '必要' ? `\n\nまた、回収にあたり事前の下見をお願いしたく存じます。\nつきましては、下見の候補日時をいくつかご教示いただけますでしょうか。` : '';
        const mailContent = `件名：産業廃棄物回収のお願い（${formData.customerName}様分）\n\nジャパンウェイスト株式会社\n濱田様\n\nいつもお世話になっております。\n（株）アステムの${formData.requester}です。\n\n下記の通り、産業廃棄物の回収をお願いしたく、ご連絡いたしました。\n※廃棄物の状態がわかる写真を本メールに添付いたします。\n\n■お客様情報\n得意先名： ${formData.customerName}\n回収先住所： ${formData.address}\n電話番号： ${formData.phone}\n\n■廃棄品目\n${itemsList}\n■総重量（概算）\n約 ${totalWeight} kg\n\n■回収希望日・その他\n${recoveryDatesText}搬出経路等： ${formData.details || '特記事項なし'}${siteVisitRequestText}\n\n上記内容にて、回収費用のお見積もりと、回収日時のご調整をお願いできますでしょうか。\n\nなお、廃棄委託契約およびお支払い条件の詳細につきましては、\n貴社よりお客様へ直接ご案内いただけますよう、申し伝えております。\n\n何卒よろしくお願い申し上げます。`;
        setMailContent(mailContent);
    };

    const copyToClipboard = () => {
        if (!mailContent) { alert('先に「メールを作成する」ボタンを押してください。'); return; }
        navigator.clipboard.writeText(mailContent).then(() => alert('メール内容をクリップボードにコピーしました！'), () => alert('コピーに失敗しました。'));
    };

    const resetForm = () => {
        if (window.confirm('入力内容をすべてクリアします。よろしいですか？')) {
            setFormData({ requester: '蒲池', customerName: '', address: '', phone: '', recoveryDate1: '', recoveryDate2: '', recoveryDate3: '', details: '', siteVisit: '不要' });
            setWasteItems({});
            setFreeWasteItem({ name: '', weight: '', quantity: '' });
            setMailContent('');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <h1 style={{borderBottom: '2px solid #007bff', paddingBottom: '10px'}}>廃棄物回収依頼フォーム</h1>
            {/* 各セクションをレンダリング */}
        </div>
    );
};

function App() {
    return (
        <div>
            <WasteCollectionForm />
        </div>
    );
}
export default App;

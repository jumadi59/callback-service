const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const {writeFileSync, existsSync, readFileSync} = require("node:fs");

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Simpan data callback di memori
let callbackData = [];

app.get('/callback', (req, res) => {
    const { transactionId, status, type, data, code, message } = req.query;

    if (!transactionId) {
        return res.status(400).json({
            success: false,
            message: 'Transaction ID tidak ada'
        });
    }
    if (!type) {
        return res.status(400).json({
            success: false,
            message: 'Type tidak ada'
        });
    }

    if (!status) {
        return res.status(400).json({
            success: false,
            message: 'Status tidak ada'
        });
    }

    const record = {
        id: transactionId,
        status: status,
        code: code,
        type: type,
        data: data || '{}',
        message: message,
        timestamp: new Date().toISOString()
    };

    // Simpan ke array
    callbackData.push(record);

    // Opsional: Simpan ke file agar persisten
    writeFileSync('callback_log.json', JSON.stringify(callbackData, null, 2));

    console.log('Callback diterima:', record);

    res.json({
        success: true,
        message: 'Callback diterima dan disimpan',
        data: record
    });
});

app.get('/transaction/:id', (req, res) => {
    const { id } = req.params;

    if (existsSync('callback_log.json')) {
        callbackData = JSON.parse(readFileSync('callback_log.json', 'utf-8'));
    }

    const record = callbackData.find(record => record.id === id);
    if (!record) {
        return res.status(404).json({
            success: false,
            message: 'Data tidak ditemukan'
        });
    }
    res.json({
        success: true,
        message: 'Data ditemukan',
        data: record
    });
})

module.exports = app;

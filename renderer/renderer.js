class ImageResizer {
    constructor() {
        this.selectedFiles = [];
        this.outputDirectory = null;
        this.isProcessing = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.setupProgressListener();
    }

    initializeElements() {
        this.selectFilesBtn = document.getElementById('selectFiles');
        this.selectedFilesDiv = document.getElementById('selectedFiles');
        this.processImagesBtn = document.getElementById('processImages');
        this.selectOutputDirBtn = document.getElementById('selectOutputDir');
        this.selectedOutputDirDiv = document.getElementById('selectedOutputDir');
        
        this.resizeModeRadios = document.querySelectorAll('input[name="resizeMode"]');
        this.pixelsOptions = document.getElementById('pixelsOptions');
        this.percentageOptions = document.getElementById('percentageOptions');
        
        this.widthInput = document.getElementById('width');
        this.heightInput = document.getElementById('height');
        this.percentageInput = document.getElementById('percentage');
        this.formatSelect = document.getElementById('format');
        this.qualityInput = document.getElementById('quality');
        
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.currentFileDiv = document.getElementById('currentFile');
        
        this.resultsSection = document.getElementById('resultsSection');
        this.resultsList = document.getElementById('resultsList');
    }

    attachEventListeners() {
        this.selectFilesBtn.addEventListener('click', () => this.selectFiles());
        this.selectOutputDirBtn.addEventListener('click', () => this.selectOutputDirectory());
        this.processImagesBtn.addEventListener('click', () => this.processImages());
        
        this.resizeModeRadios.forEach(radio => {
            radio.addEventListener('change', () => this.toggleResizeModeOptions());
        });
    }

    setupProgressListener() {
        window.electronAPI.onProcessingProgress((event, data) => {
            this.updateProgress(data);
        });
    }

    async selectFiles() {
        try {
            const files = await window.electronAPI.selectFiles();
            if (files && files.length > 0) {
                this.selectedFiles = files;
                this.displaySelectedFiles();
                this.processImagesBtn.disabled = false;
            }
        } catch (error) {
            console.error('파일 선택 중 오류:', error);
            alert('파일 선택 중 오류가 발생했습니다.');
        }
    }

    async selectOutputDirectory() {
        try {
            const directory = await window.electronAPI.selectOutputDirectory();
            if (directory) {
                this.outputDirectory = directory;
                this.selectedOutputDirDiv.textContent = directory;
                this.selectedOutputDirDiv.title = directory;
            }
        } catch (error) {
            console.error('출력 폴더 선택 중 오류:', error);
            alert('출력 폴더 선택 중 오류가 발생했습니다.');
        }
    }

    displaySelectedFiles() {
        this.selectedFilesDiv.innerHTML = '';
        
        if (this.selectedFiles.length === 0) {
            this.selectedFilesDiv.innerHTML = '<div class="file-item">선택된 파일이 없습니다.</div>';
            return;
        }

        this.selectedFiles.forEach(file => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'file-item';
            fileDiv.textContent = file.split('\\').pop().split('/').pop();
            fileDiv.title = file;
            this.selectedFilesDiv.appendChild(fileDiv);
        });

        const summary = document.createElement('div');
        summary.className = 'file-item';
        summary.style.fontWeight = 'bold';
        summary.textContent = `총 ${this.selectedFiles.length}개 파일 선택됨`;
        this.selectedFilesDiv.appendChild(summary);
    }

    toggleResizeModeOptions() {
        const selectedMode = document.querySelector('input[name="resizeMode"]:checked').value;
        
        if (selectedMode === 'pixels') {
            this.pixelsOptions.classList.remove('hidden');
            this.percentageOptions.classList.add('hidden');
        } else {
            this.pixelsOptions.classList.add('hidden');
            this.percentageOptions.classList.remove('hidden');
        }
    }

    validateInputs() {
        if (this.selectedFiles.length === 0) {
            alert('처리할 파일을 선택해주세요.');
            return false;
        }

        const resizeMode = document.querySelector('input[name="resizeMode"]:checked').value;
        
        if (resizeMode === 'pixels') {
            const width = this.widthInput.value;
            const height = this.heightInput.value;
            
            if (!width && !height) {
                alert('가로 또는 세로 중 하나 이상의 값을 입력해주세요.');
                return false;
            }
            
            if (width && (parseInt(width) <= 0)) {
                alert('가로 크기는 1 이상이어야 합니다.');
                return false;
            }
            
            if (height && (parseInt(height) <= 0)) {
                alert('세로 크기는 1 이상이어야 합니다.');
                return false;
            }
        } else {
            const percentage = this.percentageInput.value;
            if (!percentage || parseInt(percentage) <= 0) {
                alert('백분율 값을 올바르게 입력해주세요.');
                return false;
            }
        }

        const quality = this.qualityInput.value;
        if (quality && (parseInt(quality) < 1 || parseInt(quality) > 100)) {
            alert('품질은 1-100 사이의 값이어야 합니다.');
            return false;
        }

        return true;
    }

    getProcessingOptions() {
        const resizeMode = document.querySelector('input[name="resizeMode"]:checked').value;
        
        const options = {
            resizeMode,
            format: this.formatSelect.value || null,
            quality: this.qualityInput.value ? parseInt(this.qualityInput.value) : 90,
            outputDirectory: this.outputDirectory
        };

        if (resizeMode === 'pixels') {
            options.width = this.widthInput.value ? parseInt(this.widthInput.value) : null;
            options.height = this.heightInput.value ? parseInt(this.heightInput.value) : null;
        } else {
            options.percentage = parseInt(this.percentageInput.value);
        }

        return options;
    }

    async processImages() {
        if (!this.validateInputs() || this.isProcessing) {
            return;
        }

        this.isProcessing = true;
        this.processImagesBtn.disabled = true;
        this.processImagesBtn.textContent = '처리 중...';

        this.showProgressSection();
        this.hideResultsSection();

        try {
            const options = this.getProcessingOptions();
            
            const results = await window.electronAPI.processImages({
                files: this.selectedFiles,
                options
            });

            this.displayResults(results);
            this.showResultsSection();
        } catch (error) {
            console.error('이미지 처리 중 오류:', error);
            alert(`이미지 처리 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            this.isProcessing = false;
            this.processImagesBtn.disabled = false;
            this.processImagesBtn.textContent = '이미지 처리 시작';
            this.hideProgressSection();
        }
    }

    updateProgress(data) {
        const { current, total, filename } = data;
        const percentage = Math.round((current / total) * 100);
        
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = `${current} / ${total}`;
        this.currentFileDiv.textContent = `처리 중: ${filename}`;
    }

    displayResults(results) {
        this.resultsList.innerHTML = '';
        
        let successCount = 0;
        let errorCount = 0;

        results.forEach(result => {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'result-item';
            
            const filename = result.file.split('\\').pop().split('/').pop();
            
            if (result.success) {
                successCount++;
                resultDiv.classList.add('result-success');
                resultDiv.innerHTML = `
                    <div>
                        <div class="result-filename">${filename}</div>
                        <div style="font-size: 12px; color: #6c757d;">${result.outputPath}</div>
                    </div>
                    <span class="result-status status-success">완료</span>
                `;
            } else {
                errorCount++;
                resultDiv.classList.add('result-error');
                resultDiv.innerHTML = `
                    <div>
                        <div class="result-filename">${filename}</div>
                        <div class="error-message">${result.error}</div>
                    </div>
                    <span class="result-status status-error">실패</span>
                `;
            }
            
            this.resultsList.appendChild(resultDiv);
        });

        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'result-item';
        summaryDiv.style.fontWeight = 'bold';
        summaryDiv.style.backgroundColor = '#e9ecef';
        summaryDiv.innerHTML = `
            <div>처리 완료: 성공 ${successCount}개, 실패 ${errorCount}개</div>
        `;
        this.resultsList.insertBefore(summaryDiv, this.resultsList.firstChild);
    }

    showProgressSection() {
        this.progressSection.classList.remove('hidden');
    }

    hideProgressSection() {
        this.progressSection.classList.add('hidden');
    }

    showResultsSection() {
        this.resultsSection.classList.remove('hidden');
    }

    hideResultsSection() {
        this.resultsSection.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ImageResizer();
});
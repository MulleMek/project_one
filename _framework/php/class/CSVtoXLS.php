<?php
require_once 'vendors/PHPExcel/PHPExcel/IOFactory.php';

class CSVtoXLS {

	public static function convert( $inputFile, $outputFile, $type="Excel5", $delimiter=";", $encoding="UTF-8" ) {
		$reader = PHPExcel_IOFactory::createReader('CSV');

		$reader -> setDelimiter($delimiter);
		$reader -> setInputEncoding($encoding);

		if( !file_exists($inputFile) ) return false;

		try {
			$i = $reader -> load($inputFile);

			//// set Autosize in cell width
			for($col = 'A'; $col !== 'Z'; $col++) {
				$i->getActiveSheet()->getColumnDimension($col)->setAutoSize(true);
			}

			$w = PHPExcel_IOFactory::createWriter($i, $type);
			$w -> save( $outputFile );
			return true;
		} catch (Exception $e) {
			return false;			
		}
	}
}

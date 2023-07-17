<?php

class Controller {
	
	public $model;
	public $view;
	public $input = array();
	public $post = array();
	public $get = array();
	public $status;
	
	public function __construct( Model $concreteModel = null )
	{
		$this->model = $concreteModel;
		$this->view = new View();
	}
	
}

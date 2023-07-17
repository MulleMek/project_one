<?php

class MainController extends Controller
{
	public function action_index()
	{
        $this->view->generate(
            'phone_view',
            'template_view',
            [],
            [
				'specific' => ['Operator'],
                'scripts' => [ "Model", "VirtualKeyboard", "ProxyClient", "FIOController", "Clocks" ],
            ]
        );

	}

    public function action_services()
    {
        $this->view->generate(
            'services_view',
            'template_view',
            [
				"preloader" => true,
				"RootCategoryID" => Settings::get("RootCategoryID"),
			],
            [
               'scripts' => [
					(defined('IS_DEVELOPER_ON') && IS_DEVELOPER_ON) ? 'Components/vue' : 'Components/vue.min',
					'Components/vuex',

					'VirtualKeyboard',
					'Model',
					'ProxyClient',

					'Components/CategoryButton',
					'Components/ServiceButton',
					'Components/PricePopup',
					'Components/CartPopup',
					'Components/AppHeader',
					'Components/AppFooter',
					'Components/AppBody',

					'Components/Store',
					"Clocks"
				],
            ]
        );

    }
    
	/*public function action_category_json(){
		$category_id = 0;
		if (Input::exists('category_id'))
			$category_id = intval( Input::get('category_id') );

		if( !$category_id && $category_id !== 0 )
			return sj(['error' => 1, 'data' => null ]);


		$data = $this -> model -> getCategory( $category_id );
		if( !$data )
			return sj(['error' => 1, 'data' => null ]);

		return sj(['error'=> 0, 'data' => $data ]);
	}*/

}
